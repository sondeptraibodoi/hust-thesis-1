<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use App\Models\Lop\LopThi;
use App\Models\Lop\LopThiSinhVien;
use App\Models\User\SinhVien;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImportLopThiBuController extends Controller
{
    public function import(Request $request)
    {
        // chỉ sinh user ở giáo viên lần đầu tiên import, và trả về mật khẩu cho những giáo viên đó
        $request->validate([
            "items" => ["required", "array"],
            "fields" => ["required"],
            "ki_hoc" => ["required", "string"],
            "loai_dot_thi" => ["required", "string"],
            "fields.ma_lop" => ["required", "string"],
            "fields.ma_hp" => ["required", "string"],
            "fields.mssv" => ["required", "string"],
            "fields.nhom" => ["nullable", "string"],
            "fields.loai_dot_thi" => ["required", "string"],
            "fields.ngay_thi" => ["nullable", "string"],
            "fields.kip_thi" => ["nullable", "string"],
            "fields.phong_thi" => ["nullable", "string"],
        ]);
        $items = $request->get("items");
        $fields = $request->get("fields");
        $ki_hoc = $request->get("ki_hoc");
        $loai_dot_thi = $request->get("loai_dot_thi");
        $loai_dot_thi_goc = str_replace("TB-", "", $loai_dot_thi);
        $lop = Lop::updateOrCreate(
            [
                "ma" => "thi_bu",
                "ki_hoc" => $ki_hoc,
                "ten_hp" => "Thi bù",
                "ma_hp" => "thi_bu",
            ],
            [
                "ghi_chu" => "Đây là lớp cho thi bù, vui lòng không xoá",
            ]
        );
        $cache = [];
        $sinh_viens = SinhVien::whereHas("lops", function ($query) use ($ki_hoc) {
            $query->where("ki_hoc", $ki_hoc);
        })
            ->get(["id", "mssv"])
            ->mapWithKeys(function ($item, $key) {
                return [$item["mssv"] => $item["id"]];
            });
        try {
            $data_insert = [];
            DB::beginTransaction();
            $items_return = [];
            $stt = 1;
            foreach ($items as $item) {
                $res = ImportHelper::convertTime($fields, $item);
                $ngay_thi = $res["ngay_thi"] ?? "";
                $kip_thi = $res["kip_thi"] ?? "";
                $phong_thi = $res["phong_thi"] ?? "";
                $ma_lop = $res["ma_lop"] ?? "";
                $key = "$ngay_thi - $kip_thi - $phong_thi";
                if (empty($cache[$key])) {
                    $ngay_thi = !empty($res["ngay_thi"]) ? Carbon::createFromFormat("d/m/Y", $res["ngay_thi"]) : null;
                    $cache[$key] = LopThi::updateOrCreate(
                        [
                            "lop_id" => $lop->getKey(),
                            "loai" => $loai_dot_thi,
                            "ngay_thi" => $ngay_thi,
                            "kip_thi" => $kip_thi,
                            "phong_thi" => $phong_thi,
                        ],
                        ["ma" => "Thi bù - " . $key]
                    );
                }
                $student = $sinh_viens[$res["mssv"]] ?? "";
                $lop_thi_goc = LopThi::whereHas("lop", function ($query) use ($ma_lop, $ki_hoc) {
                    $query->where("ma", $ma_lop);
                    $query->where("ki_hoc", $ki_hoc);
                })
                    ->where("loai", $loai_dot_thi_goc)
                    ->whereHas("sinhViens", function ($query) use ($student) {
                        $query->where("id", $student);
                    })
                    ->first();
                $lop_thi = $cache[$key]->getKey();
                if (!$student) {
                    $mssv = $res["mssv"];
                    abort(400, "Sinh viên $mssv không tồn tại trong dữ liệu");
                }
                if (!$lop_thi_goc) {
                    $mssv = $res["mssv"];
                    abort(400, "Sinh viên $mssv chưa có dữ liệu lớp thi: $ma_lop");
                }
                if (!empty($old_class_exam) && $lop_thi != $old_class_exam) {
                    $stt = 1;
                    LopThiSinhVien::where("lop_thi_id", $old_class_exam)->delete();
                    LopThiSinhVien::insert($data_insert);
                    $data_insert = [];
                }
                $data_insert[] = [
                    "lop_thi_id" => $lop_thi,
                    "sinh_vien_id" => $student,
                    "stt" => $stt,
                    "lop_thi_goc_id" => $lop_thi_goc->getKey(),
                ];
                $stt++;
                $old_class_exam = $lop_thi;
            }
            if (count($data_insert) > 0) {
                LopThiSinhVien::where("lop_thi_id", $lop_thi)->delete();
                LopThiSinhVien::insert($data_insert);
                $data_insert = [];
                $stt = 1;
            }
            DB::commit();
            return $this->responseSuccess($items_return);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }
}
