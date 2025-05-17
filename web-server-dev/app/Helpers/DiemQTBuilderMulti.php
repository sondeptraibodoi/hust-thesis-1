<?php

namespace App\Helpers;

use App\Enums\LoaiThi;
use App\Models\Diem\Diem;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\Lop\Lop;
use DB;

class DiemQTBuilderMulti
{
    protected $lops;
    protected $extras;
    protected $diems;
    protected $diem_chuongs;
    public function __construct($lops)
    {
        $this->lops = $lops;
        $this->init();
    }
    public function init()
    {
        $lop_ids = $this->lops->map(function ($lop) {
            return $lop->getKey();
        });

        $query = DB::table("ph_diems")
            ->join("u_sinh_viens", function ($join) {
                $join->on("ph_diems.sinh_vien_id", "u_sinh_viens.id");
            })
            ->join("ph_lop_this", function ($join) {
                $join->on("ph_diems.lop_thi_id", "ph_lop_this.id");
            });
        $query->orderBy("ph_lop_this.loai");
        $query->select([
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
        $query->whereIn("ph_lop_this.loai", ["GK", "GK2"]);
        $query->whereIn("ph_lop_this.lop_id", $lop_ids);
        $this->diems = $query->get()->reduce(function ($acc, $item) {
            if (empty($acc[$item->lop_id])) {
                $acc[$item->lop_id] = [];
            }
            $acc[$item->lop_id][$item->sinh_vien_id][$item->loai] = DiemQTHelper::getDiem((array) $item);
            $acc[$item->lop_id][$item->sinh_vien_id]["thong_tin"] = [
                "sinh_vien_mssv" => $item->sinh_vien_mssv ?? "",
                "sinh_vien_name" => $item->sinh_vien_name ?? "",
            ];
            return $acc;
        }, []);
        $this->extras = DiemQTHelper::getExtraForLops($lop_ids);
        $query_chuong = DB::table(
            DB::raw("(select lop_id, sinh_vien_id, sum(diem) as diem ,1 as type,'diem-thi-chuong' as loai from hp_sinh_vien_chuong_diem_view group by lop_id, sinh_vien_id
union select lop_id, sinh_vien_id, diem, 2 as type,loai from ph_lop_sinh_vien_diems where loai = 'diem-lt-b-learning') AS a")
        );
        $query_chuong->whereIn("a.lop_id", $lop_ids);
        if (!empty($sinh_vien_id)) {
            $query_chuong->where("a.sinh_vien_id", $sinh_vien_id);
        }
        $query_chuong->orderBy("a.type");
        $this->diem_chuongs = $query_chuong->get()->reduce(function ($acc, $item) {
            if (empty($acc[$item->lop_id])) {
                $acc[$item->lop_id] = [];
            }
            $acc[$item->lop_id][$item->sinh_vien_id] = ["diem" => $item->diem, "loai" => $item->loai];
            return $acc;
        }, []);
    }
    public function getDiemQT(Lop $lop, $sinh_vien_id)
    {
        $handle = new DiemQTBuilder($lop);
        $handle->setCache(
            $this->diems[$lop->getKey()] ?? null,
            $this->extras[$lop->getKey()] ?? null,
            $this->diem_chuongs[$lop->getKey()] ?? null
        );
        return $handle->getDiemQT($sinh_vien_id);
    }
}
