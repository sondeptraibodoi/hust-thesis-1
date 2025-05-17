<?php

namespace App\Http\Controllers\Api\Import;

use App\Helpers\DiemHelper;
use App\Http\Controllers\Controller;
use App\Models\PhucKhao\PhucKhao;
use App\Models\TinNhan\TinNhan;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class ImportTinNhanController extends Controller
{
    public function import(Request $request)
    {
        // chỉ sinh user ở giáo viên lần đầu tiên import, và trả về mật khẩu cho những giáo viên đó
        $request->validate([
            "items" => ["required", "array"],
            "fields" => ["required"],
            "fields.phi" => ["required", "string"],
            "fields.tin_nhan" => ["required", "string"],
        ]);
        $items = $request->get("items");
        $fields = $request->get("fields");
        try {
            DB::beginTransaction();
            $items_return = [];
            foreach ($items as $item) {
                $phi = 0;
                $res = ImportHelper::convertTime($fields, $item);
                $message = $res["tin_nhan"];
                $message = str_replace(["\r\n", "\n", "\r"], " ", $message);
                $message = preg_replace("/\s+/", " ", $message); // Replace multiple spaces with one
                $message = trim($message); // Optional: Remove spaces from the beginning and end
                $tin_nhan_model = TinNhan::where("tin_nhan", "like", "%" . $message . "%")->first();
                if (!empty($tin_nhan_model)) {
                    continue;
                }
                $phi = $res["phi"];
                $phi = preg_replace("/,/", "", $phi);
                preg_match("/SAMI\d+/", $message, $matches);
                if (isset($matches) && count($matches) > 0) {
                    $payment_code = preg_replace("/\D+/", "", $matches[0]);
                }
                $phuc_khao = PhucKhao::where("ma_thanh_toan", $payment_code)->first();
                if (!empty($phuc_khao) && $phuc_khao->trang_thai === "chua_thanh_toan" && $phi >= 20000) {
                    $phuc_khao->update([
                        "trang_thai" => "da_thanh_toan",
                    ]);
                }
                $tin_nhan = TinNhan::create([
                    "tin_nhan" => $message,
                    "ngay_nhan" => Carbon::now(),
                    "trang_thai" => !empty($phuc_khao) ? "1" : "0",
                    "gia" => $phi ?? 0,
                    "ma_thanh_toan" => $payment_code,
                    "from" => "excel",
                ]);
                $items_return[] = $res;
            }
            DB::commit();
            return $this->responseSuccess($items_return);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }
}
