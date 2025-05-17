<?php

namespace App\Helpers;

use App\Enums\LoaiThi;
use App\Models\Diem\Diem;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\Lop\Lop;
use DB;

class DiemQTBuilder
{
    protected $lop;
    protected $handle;
    protected static function build(Lop $lop): ADiem
    {
        if ($lop->loai_thi == LoaiThi::Thi_Theo_Chuong) {
            return new DiemThiTheoChuong($lop);
        }
        if ($lop->loai_thi == LoaiThi::Thi_GK_30) {
            return new DiemThiGK30($lop);
        }
        if ($lop->loai_thi == LoaiThi::Thi_2_GK) {
            return new DiemThi2GK($lop);
        }
        return new DiemThiDefault($lop);
    }
    public function __construct(Lop $lop)
    {
        $this->lop = $lop;
        $this->handle = DiemQTBuilder::build($lop);
    }
    public function init($sinh_vien_id = null)
    {
        return $this->handle->init($sinh_vien_id);
    }
    public function getDiemCK($sinh_vien_id)
    {
        return $this->handle->getDiemCK($sinh_vien_id);
    }
    public function getDiem($sinh_vien_id)
    {
        return $this->handle->getDiem($sinh_vien_id);
    }
    public function getDiemHP($diem_QT, $diem_CK)
    {
        $diem_hp = null;
        if ($diem_QT == "-" || $diem_QT == -1) {
            $diem_QT = 0;
        }
        if ($diem_CK == "-" || $diem_CK == -1) {
            $diem_CK = 0;
        }
        if (isset($diem_QT) && isset($diem_CK)) {
            $diem_hp = 0.5 * ($diem_QT + $diem_CK);
        }
        return $diem_hp;
    }
    public function getDiemQT($sinh_vien_id)
    {
        $diem_QT = $this->handle->getDiemQT($sinh_vien_id);

        if (!empty($diem_QT)) {
            $diem_QT = round($diem_QT * 2) / 2;
        }
        if ($diem_QT === 0.0) {
            $diem_QT = "0";
        }
        return $diem_QT;
    }
    public function setCache($diems, $extras, $diem_chuong)
    {
        $this->handle->setCache($diems, $extras, $diem_chuong);
        $this->handle->init();
    }
}

abstract class ADiem
{
    protected $lop;
    protected $diems;
    protected $extras;
    protected $use_cache = false;
    public function __construct(Lop $lop)
    {
        $this->lop = $lop;
    }
    public function setCache($diems, $extras, $diems_chuong)
    {
        $this->diems = $diems;
        $this->extras = $extras;
        $this->use_cache = true;
    }
    public function init($sinh_vien_id = null)
    {
        if (!$this->use_cache) {
            $lop_id = $this->lop->getKey();
            $query_diems = Diem::query();
            $query_diems
                ->join("ph_lop_this", function ($join) {
                    $join->on("ph_diems.lop_thi_id", "ph_lop_this.id");
                })
                ->join("u_sinh_viens", function ($join) {
                    $join->on("ph_diems.sinh_vien_id", "u_sinh_viens.id");
                })
                ->join("d_bang_diems", "ph_diems.bang_diem_id", "=", "d_bang_diems.id");
            $query_diems->select([
                "ph_diems.id",
                "ph_diems.sinh_vien_id",
                DB::raw("u_sinh_viens.mssv as sinh_vien_mssv"),
                DB::raw("u_sinh_viens.name as sinh_vien_name"),
                "ph_diems.lop_thi_id",
                "ph_diems.diem",
                "ph_diems.ghi_chu",
                "ph_lop_this.lop_id",
                "ph_lop_this.loai",
            ]);
            $query_diems->whereRaw("d_bang_diems.ngay_cong_khai <= NOW()");
            if (!empty($sinh_vien_id)) {
                $query_diems->where("sinh_vien_id", $sinh_vien_id);
            }
            $query_diems->where("ph_lop_this.lop_id", $lop_id);
            $this->diems = $query_diems->get()->reduce(function ($acc, $item) {
                if (empty($acc[$item->sinh_vien_id])) {
                    $acc[$item->sinh_vien_id] = [];
                }
                $acc[$item->sinh_vien_id][$item->loai] = DiemQTHelper::getDiem($item->toArray());
                $acc[$item->sinh_vien_id]["thong_tin"] = [
                    "sinh_vien_mssv" => $item->sinh_vien_mssv ?? "",
                    "sinh_vien_name" => $item->sinh_vien_name ?? "",
                ];
                return $acc;
            }, []);
        }
        if (empty($this->extras)) {
            $this->extras = DiemQTHelper::getExtra($lop_id, $sinh_vien_id);
        }
    }
    abstract function getDiemQT($sinh_vien_id);
    function getDiemCK($sinh_vien_id)
    {
        return $this->diems[$sinh_vien_id]["CK"] ?? null;
    }
    function getDiem($sinh_vien_id)
    {
        $diem = $this->diems[$sinh_vien_id] ?? [];
        $diem["DIEM_CHUYEN_CAN"] = $this->extras[$sinh_vien_id]["diem"] ?? 0;
        $diem["DIEM_CK"] = $diem["CK"] ?? null;
        return $diem;
    }
}
class DiemThiTheoChuong extends ADiem
{
    protected $diems_chuong;
    public function setCache($diems, $extras, $diems_chuong)
    {
        $this->diems = $diems;
        $this->extras = $extras;
        $this->diems_chuong = $diems_chuong;
        $this->use_cache = true;
    }
    public function init($sinh_vien_id = null)
    {
        parent::init();
        if (!$this->use_cache) {
            $lop_id = $this->lop->getKey();
            $query_chuong = DB::table(
                DB::raw("(select lop_id, sinh_vien_id, sum(diem) as diem ,1 as type,'diem-thi-chuong' as loai from hp_sinh_vien_chuong_diem_view group by lop_id, sinh_vien_id
union select lop_id, sinh_vien_id, diem, 2 as type,loai from ph_lop_sinh_vien_diems where loai = 'diem-lt-b-learning') AS a")
            );
            $query_chuong->where("a.lop_id", $lop_id);
            if (!empty($sinh_vien_id)) {
                $query_chuong->where("a.sinh_vien_id", $sinh_vien_id);
            }
            $query_chuong->orderBy("a.type");
            $this->diems_chuong = $query_chuong->get()->reduce(function ($acc, $item) {
                if (empty($acc[$item->sinh_vien_id])) {
                    $acc[$item->sinh_vien_id] = [];
                }
                $acc[$item->sinh_vien_id] = ["diem" => $item->diem, "loai" => $item->loai];
                return $acc;
            }, []);
        }
    }
    public function getDiemQT($sinh_vien_id)
    {
        $lop_extra = $this->extras[$sinh_vien_id] ?? [];
        $diems = $this->diems[$sinh_vien_id] ?? [];

        $diem_chuyen_can = $lop_extra["diem"] ?? 0; // diem chuyen can
        $diem_y_thuc = $lop_extra["diem_y_thuc"] ?? 0; // diem tich cuc
        $diem_gk_1 = $diems["GK"] ?? null;
        if (!isset($diem_gk_1)) {
            return "0";
        }
        if ($diem_gk_1 == "-" || $diem_gk_1 == -1) {
            return "0";
        }
        $DCCATC = $diem_chuyen_can + $diem_y_thuc;

        $DLT = $this->diems_chuong[$sinh_vien_id]["diem"] ?? 0;
        $diem_QT = $DCCATC + 0.2 * $DLT + ($diem_gk_1 * 0.6) / 3;
        return $diem_QT;
    }

    function getDiem($sinh_vien_id)
    {
        $diems = parent::getDiem($sinh_vien_id);
        $diems["DIEM_LT"] = $this->diems_chuong[$sinh_vien_id]["diem"] ?? 0;
        $diems["DIEM_LT_LOAI"] = $this->diems_chuong[$sinh_vien_id]["loai"] ?? "";
        return $diems;
    }
}
class DiemThiGK30 extends ADiem
{
    public function getDiemQT($sinh_vien_id)
    {
        $lop_extra = $this->extras[$sinh_vien_id] ?? [];
        $diems = $this->diems[$sinh_vien_id] ?? [];

        $diem_chuyen_can = $lop_extra["diem"] ?? 0; // diem chuyen can
        $diem_y_thuc = $lop_extra["diem_y_thuc"] ?? 0; // diem tich cuc
        $diem_gk_1 = $diems["GK"] ?? null;
        if (!isset($diem_gk_1)) {
            return "0";
        }
        if ($diem_gk_1 == "-" || $diem_gk_1 == -1) {
            return "0";
        }
        $DKTĐK = $diem_gk_1 / 3 + $diem_y_thuc;
        if ($DKTĐK > 10) {
            $DKTĐK = 10;
        }
        $diem_QT = 0.6 * $DKTĐK + 0.4 * $diem_chuyen_can;
        return $diem_QT;
    }
}

class DiemThi2GK extends ADiem
{
    public function getDiemQT($sinh_vien_id)
    {
        $lop_extra = $this->extras[$sinh_vien_id] ?? [];
        $diems = $this->diems[$sinh_vien_id] ?? [];

        $diem_chuyen_can = $lop_extra["diem"] ?? 0; // diem chuyen can
        $diem_y_thuc = $lop_extra["diem_y_thuc"] ?? 0; // diem tich cuc

        $diem_gk_1 = $diems["GK"] ?? null;
        $diem_gk_2 = $diems["GK2"] ?? null;

        if (!isset($diem_gk_1) || !isset($diem_gk_2)) {
            return null;
        }
        if ($diem_gk_1 == "-" || $diem_gk_1 == -1) {
            return "0";
        }
        if ($diem_gk_2 == "-" || $diem_gk_2 == -1) {
            return "0";
        }

        $DKTĐK = ($diem_gk_1 + $diem_gk_2) / 3 + $diem_y_thuc;
        if ($DKTĐK > 10) {
            $DKTĐK = 10;
        }
        $diem_QT = 0.6 * $DKTĐK + 0.4 * $diem_chuyen_can;
        return $diem_QT;
    }
}

class DiemThiDefault extends ADiem
{
    public function getDiemQT($sinh_vien_id)
    {
        $lop_extra = $this->extras[$sinh_vien_id] ?? [];
        $diems = $this->diems;

        $diem_chuyen_can = $lop_extra["diem"] ?? 0; // diem chuyen can
        $diem_y_thuc = $lop_extra["diem_y_thuc"] ?? 0; // diem tich cuc

        $diem_gk = $diems["GK"] ?? null;

        if (isset($diem_gk)) {
            return null;
        }
        if ($diem_gk == "-" || $diem_gk == -1) {
            return "0";
        }
        $DKTĐK = $diem_gk + $diem_y_thuc;
        if ($DKTĐK > 10) {
            $DKTĐK = 10;
        }
        $diem_QT = 0.6 * $DKTĐK + 0.4 * $diem_chuyen_can;
        return $diem_QT;
    }
}
