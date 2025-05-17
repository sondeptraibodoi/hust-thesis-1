<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use App\Models\User\SinhVien;
use DateTime;
use DB;
use Illuminate\Http\Request;
use Spatie\ResponseCache\Facades\ResponseCache;

class ImportSinhVienController extends Controller
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
            "fields.sinh_vien_birthday" => ["nullable", "string"],
            "fields.sinh_vien_lop" => ["nullable", "string"],
            "fields.sinh_vien_nhom" => ["required", "string"],
        ]);
        $items = $request->get("items");
        $fields = $request->get("fields");
        $ki_hoc = $request->get("ki_hoc");
        try {
            DB::beginTransaction();
            $items_return = [];
            $stt_current_ma = "";
            $stt = 1;
            $old_class = "";
            $lop_cache = [];
            $lops = Lop::where("ki_hoc", $ki_hoc)->get(["id", "ma"]);
            $sinh_vien_cache = [];
            $sinh_viens = SinhVien::get(["id", "mssv", "group"])->mapWithKeys(function ($item, $key) {
                return [
                    $item["mssv"] => [
                        "id" => $item["id"],
                        "group" => $item["group"],
                    ],
                ];
            });
            $data_insert = [];
            foreach ($items as $item) {
                $res = ImportHelper::convertTime($fields, $item);

                if (empty($lop_cache[$res["ma_lop"]])) {
                    $temp = $lops->where("ma", $res["ma_lop"])->first();
                    if (empty($temp)) {
                        $temp = Lop::create([
                            "ma" => $res["ma_lop"],
                            "ma_hp" => $res["ma_hp"],
                            "ten_hp" => $res["ten_hp"],
                            "ki_hoc" => $ki_hoc,
                        ]);
                    }
                    if (isset($temp)) {
                        $lop_cache[$res["ma_lop"]] = $temp->getKey();
                    }
                }
                $lop_id = $lop_cache[$res["ma_lop"]];

                if (empty($sinh_vien_cache[$res["sinh_vien_id"]])) {
                    $temp = $sinh_viens[$res["sinh_vien_id"]] ?? null;
                    $sinh_vien_id = $temp["id"] ?? null;
                    $birthday = !empty($res["sinh_vien_birthday"])
                        ? \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($res["sinh_vien_birthday"] ?? "")
                        : "";
                    $date = $birthday instanceof DateTime ? $birthday->format("Y-m-d") : $birthday;
                    if (empty($temp)) {
                        $temp = SinhVien::updateOrCreate(
                            [
                                "mssv" => $res["sinh_vien_id"],
                            ],
                            [
                                "name" => $res["sinh_vien_name"] ?? "",
                                "birthday" => $date,
                                "group" => $res["sinh_vien_lop"] ?? "",
                            ]
                        );
                        $sinh_vien_id = $temp->getKey();
                    } elseif (empty($temp["group"]) || $temp["group"] != $res["sinh_vien_lop"]) {
                        $temp = SinhVien::updateOrCreate(
                            [
                                "mssv" => $res["sinh_vien_id"],
                            ],
                            [
                                "name" => $res["sinh_vien_name"] ?? "",
                                "birthday" => $date,
                                "group" => $res["sinh_vien_lop"] ?? "",
                            ]
                        );
                        $sinh_vien_id = $temp->getKey();
                    }

                    if (isset($temp)) {
                        $sinh_vien_cache[$res["sinh_vien_id"]] = $sinh_vien_id;
                    }
                }

                if (empty($stt_current_ma) || $stt_current_ma != $res["ma_lop"]) {
                    $stt = 1;
                    $stt_current_ma = $res["ma_lop"];
                    DB::table("ph_lop_sinh_viens")->where("lop_id", $lop_id)->delete();
                    DB::table("ph_lop_sinh_viens")->insert($data_insert);
                    $data_insert = [];
                }

                $sinh_vien_id = $sinh_vien_cache[$res["sinh_vien_id"]];
                $data_insert[] = [
                    "lop_id" => $lop_id,
                    "sinh_vien_id" => $sinh_vien_id,
                    "stt" => $stt,
                    "nhom" => $res["sinh_vien_nhom"] ?? "",
                    "diem" => 1,
                ];
                $old_class = $lop_id;
                $stt++;
            }
            if (count($data_insert) > 0) {
                DB::table("ph_lop_sinh_viens")->where("lop_id", $lop_id)->delete();
                DB::table("ph_lop_sinh_viens")->insert($data_insert);
                $data_insert = [];
            }
            $sinh_viens = SinhVien::whereNull("email")->get();
            foreach ($sinh_viens as $sinh_vien) {
                if (empty($sinh_vien->email)) {
                    $email = $this->getEmail($sinh_vien);
                    $sinh_vien->email = $email;
                    $sinh_vien->save();
                }
            }
            DB::commit();
            ResponseCache::clear();
            return $this->responseSuccess($items_return);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }

    public function getEmail($sinh_vien)
    {
        try {
            $mssv = $sinh_vien->mssv;
            if (strlen($mssv) >= 8) {
                $mssv = substr($mssv, 2);
            }
            $name = $sinh_vien->name;
            $name = $this->convert_vi_to_en($name);
            $name = strtolower($name);
            $names = explode(" ", $name);
            $name = array_pop($names);
            $sub = "";
            foreach ($names as $item) {
                if (!empty($item)) {
                    $sub .= $item[0];
                }
            }
            if (!empty($name) && strlen($mssv) >= 6 && !empty($sub)) {
                return "$name.$sub$mssv@sis.hust.edu.vn";
            }
            return "";
        } catch (\Throwable $th) {
            return "";
        }
    }
    public function convert_vi_to_en($str)
    {
        $str = preg_replace(
            [
                "/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|ầ|ạ)/",
                "/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/",
                "/(ì|í|ị|ỉ|ĩ|ì)/",
                "/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/",
                "/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/",
                "/(ỳ|ý|ỵ|ỷ|ỹ)/",
                "/(đ)/",
                "/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/",
                "/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/",
                "/(Ì|Í|Ị|Ỉ|Ĩ)/",
                "/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/",
                "/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/",
                "/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/",
                "/(Đ)/",
            ],
            ["a", "e", "i", "o", "u", "y", "d", "A", "E", "I", "O", "U", "Y", "D"],
            $str
        );
        return $str;
    }
}
