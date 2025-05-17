<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use App\Models\Lop\LopGiaoVienPhanBien;
use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use DB;
use Illuminate\Http\Request;

class ImportSinhVienPhanBienController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            "items" => ["required", "array"],
            "fields" => ["required"],
            "fields.mssv" => ["required", "string"],
            "fields.giao_vien_phan_bien_email" => ["required", "string"],
            "fields.ma_hp" => ["required", "string"],
        ]);
        $items = $request->get("items");
        $fields = $request->get("fields");
        $ki_hoc = $request->get("ki_hoc");
        $query_lop_id = SinhVien::join("ph_lop_sinh_viens", function ($join) {
            $join->on("ph_lop_sinh_viens.sinh_vien_id", "u_sinh_viens.id");
        })
            ->join("ph_lops", function ($join) {
                $join->on("ph_lop_sinh_viens.lop_id", "ph_lops.id");
            })
            ->where("ph_lops.ki_hoc", $ki_hoc);
        $query_lop_id->join("ph_ma_hoc_phans", function ($join) {
            $join->on("ph_lops.ma_hp", "ph_ma_hoc_phans.ma");
        });
        $query_lop_id->where(function ($query) {
            $query->where("is_do_an", true);
            $query->orWhere("is_do_an_tot_nghiep", true);
            $query->orWhere("is_thuc_tap", true);
        });
        $query_lop_id->orderBy("ph_lops.ma_hp");
        $lop_ids = $query_lop_id
            ->select([
                DB::raw("u_sinh_viens.mssv as sinh_vien_mssv"),
                DB::raw("u_sinh_viens.id as sinh_vien_id"),
                DB::raw("ph_lops.ma_hp as ma_hp"),
                DB::raw("ph_lops.id as lop_id"),
            ])
            ->get()
            ->mapWithKeys(function ($item, $key) {
                $key = $item->sinh_vien_mssv . "-" . $item->ma_hp;
                return [
                    $key => [
                        "lop_id" => $item->lop_id,
                        "sinh_vien_id" => $item->sinh_vien_id,
                        "mssv" => $item->sinh_vien_mssv,
                        "ma_hp" => $item->ma_hp,
                    ],
                ];
            })
            ->toArray();
        $giao_viens = GiaoVien::get(["id", "email"])
            ->mapWithKeys(function ($item, $key) {
                return [$item["email"] => $item["id"]];
            })
            ->toArray();
        try {
            $items_return = [];
            DB::beginTransaction();
            LopGiaoVienPhanBien::whereHas("lop", function ($query) use ($ki_hoc) {
                $query->where("ki_hoc", $ki_hoc);
            })->delete();
            $data_insert = [];
            foreach ($items as $item) {
                $res = ImportHelper::convertTime($fields, $item);
                $key = $res["mssv"] . "-" . $res["ma_hp"];
                if (empty($res["mssv"]) || empty($res["ma_hp"])) {
                    continue;
                }
                $lop = $lop_ids[$key] ?? null;
                if (!$lop) {
                    $mssv = $res["mssv"];
                    $ma_hp = $res["ma_hp"];
                    return response()->json(
                        [
                            "message" => "Sinh viên $mssv của lớp $ma_hp không tồn tại trong dữ liệu",
                        ],
                        404
                    );
                }
                $sinh_vien_id = $lop["sinh_vien_id"];
                $lop_id = $lop["lop_id"];
                $giao_vien_id = $giao_viens[$res["giao_vien_phan_bien_email"]] ?? null;
                if (!$giao_vien_id) {
                    $mssv = $res["giao_vien_huong_dan_email"];
                    return response()->json(
                        [
                            "message" => "Email $mssv không tồn tại trong dữ liệu",
                        ],
                        404
                    );
                }
                $data_insert[] = [
                    "lop_id" => $lop_id,
                    "sinh_vien_id" => $sinh_vien_id,
                    "giao_vien_id" => $giao_vien_id,
                ];
            }
            LopGiaoVienPhanBien::insert($data_insert);
            DB::commit();
            return $this->responseSuccess($items_return);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }
}
