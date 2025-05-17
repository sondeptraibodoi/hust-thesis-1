<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use DateTime;
use DB;
use Illuminate\Http\Request;
use Spatie\ResponseCache\Facades\ResponseCache;

class ImportDoAnController extends Controller
{
    public function import(Request $request)
    {
        // chỉ sinh user ở giáo viên lần đầu tiên import, và trả về mật khẩu cho những giáo viên đó
        $request->validate([
            "items" => ["required", "array"],
            "fields" => ["required"],
            "fields.ma_lop" => ["required", "string"],
            "fields.ma_hp" => ["required", "string"],
            "fields.ten_hp" => ["required", "string"],
            "fields.sinh_vien_id" => ["required", "string"],
            "fields.sinh_vien_name" => ["nullable", "string"],
            "fields.sinh_vien_nhom" => ["nullable", "string"],
            "fields.giao_vien_huong_dan_email" => ["required", "string"],
            "fields.ten_do_an" => ["nullable", "string"],
            "fields.noi_dung" => ["nullable", "string"],
            "fields.cac_moc_quan_trong" => ["nullable", "string"],
        ]);
        $items = $request->get("items");
        $fields = $request->get("fields");
        $ki_hoc = $request->get("ki_hoc");
        try {
            DB::beginTransaction();
            $items_return = [];
            $stt_current_ma = "";
            $stt = 1;
            $lop_cache = [];
            $lops = Lop::where("ki_hoc", $ki_hoc)
                ->whereHas("maHocPhan", function ($query) {
                    $query->isDoAn();
                })
                ->get(["ma", "id"])
                ->mapWithKeys(function ($item, $key) {
                    return [$item["ma"] => $item];
                });
            $sinh_vien_cache = [];
            $sinh_viens = SinhVien::get(["id", "mssv"])->mapWithKeys(function ($item, $key) {
                return [$item["mssv"] => $item["id"]];
            });
            $giao_viens = GiaoVien::get(["id", "email"])
                ->mapWithKeys(function ($item, $key) {
                    return [$item["email"] => $item["id"]];
                })
                ->toArray();
            $data_do_an_insert = [];
            $data_insert = [];
            foreach ($items as $item) {
                $res = ImportHelper::convertTime($fields, $item);
                if (empty($lop_cache[$res["ma_lop"]])) {
                    $temp = $lops[$res["ma_lop"]] ?? null;
                    if (empty($temp)) {
                        $temp = Lop::create([
                            "ma" => $res["ma_lop"],
                            "ma_hp" => $res["ma_hp"],
                            "ten_hp" => $res["ten_hp"],
                            "ki_hoc" => $ki_hoc,
                        ]);
                        $lops[$res["ma_lop"]] = $temp;
                    }
                    if (isset($temp)) {
                        $lop_cache[$res["ma_lop"]] = $temp->getKey();
                    }
                }
                $lop_id = $lop_cache[$res["ma_lop"]];

                if (empty($sinh_vien_cache[$res["sinh_vien_id"]])) {
                    $temp = $sinh_viens[$res["sinh_vien_id"]] ?? null;
                    if (empty($temp)) {
                        $temp = SinhVien::updateOrCreate(
                            [
                                "mssv" => $res["sinh_vien_id"],
                            ],
                            [
                                "name" => $res["sinh_vien_name"] ?? "",
                                "group" => $res["sinh_vien_lop"] ?? "",
                            ]
                        );
                        $temp = $temp->getKey();
                    }

                    if (isset($temp)) {
                        $sinh_vien_cache[$res["sinh_vien_id"]] = $temp;
                    }
                }

                if (empty($stt_current_ma) || $stt_current_ma != $res["ma_lop"]) {
                    $stt = 1;
                    $stt_current_ma = $res["ma_lop"];
                    DB::table("ph_lop_sinh_vien_do_ans")->where("lop_id", $lop_id)->delete();
                    DB::table("ph_lop_sinh_vien_do_ans")->insert($data_do_an_insert);
                    $data_do_an_insert = [];
                    DB::table("ph_lop_sinh_viens")->where("lop_id", $lop_id)->delete();
                    DB::table("ph_lop_sinh_viens")->insert($data_insert);
                    $data_insert = [];
                }

                $sinh_vien_id = $sinh_vien_cache[$res["sinh_vien_id"]];
                $giao_vien_id = $giao_viens[$res["giao_vien_huong_dan_email"]] ?? null;
                if (isset($giao_vien_id) && isset($sinh_vien_id)) {
                    $data_do_an_insert[] = [
                        "lop_id" => $lop_id,
                        "sinh_vien_id" => $sinh_vien_id,
                        "ten_de_tai" => $res["ten_do_an"] ?? null,
                        "noi_dung" => $res["noi_dung"] ?? null,
                        "cac_moc_quan_trong" => $res["cac_moc_quan_trong"] ?? null,
                        "giao_vien_id" => $giao_vien_id,
                    ];
                }
                $data_insert[] = [
                    "lop_id" => $lop_id,
                    "sinh_vien_id" => $sinh_vien_id,
                    "stt" => $stt,
                    "nhom" => $res["sinh_vien_nhom"] ?? "",
                ];
                $stt++;
            }

            if (count($data_insert) > 0) {
                DB::table("ph_lop_sinh_viens")->where("lop_id", $lop_id)->delete();
                DB::table("ph_lop_sinh_viens")->insert($data_insert);
                $data_insert = [];
            }
            if (count($data_do_an_insert) > 0) {
                DB::table("ph_lop_sinh_vien_do_ans")->where("lop_id", $lop_id)->delete();
                DB::table("ph_lop_sinh_vien_do_ans")->insert($data_do_an_insert);
                $data_do_an_insert = [];
            }
            DB::commit();
            ResponseCache::clear();
            return $this->responseSuccess($items_return);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }
}
