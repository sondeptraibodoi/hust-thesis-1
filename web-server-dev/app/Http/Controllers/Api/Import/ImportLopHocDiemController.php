<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use App\Models\Lop\LopDiem;
use App\Models\Lop\LopGiaoVienPhanBien;
use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use DB;
use Illuminate\Http\Request;

class ImportLopHocDiemController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            "items" => ["required", "array"],
            "fields" => ["required"],
            "fields.mssv" => ["required", "string"],
            "fields.diem" => ["required", "string"],
            "fields.ma" => ["required", "string"],
        ]);
        $items = $request->get("items");
        $fields = $request->get("fields");
        $ki_hoc = $request->get("ki_hoc");
        $sinh_viens = SinhVien::select(["id", "mssv", "group"])
            ->whereHas("lops", function ($query) use ($ki_hoc) {
                $query->where("ki_hoc", $ki_hoc);
            })
            ->get()
            ->mapWithKeys(function ($item, $key) {
                return [
                    $item["mssv"] => [
                        "id" => $item["id"],
                        "group" => $item["group"],
                    ],
                ];
            });
        $lops = Lop::select(["id", "ma"])
            ->where("ki_hoc", $ki_hoc)
            ->get()
            ->mapWithKeys(function ($item, $key) {
                return [
                    $item["ma"] => [
                        "id" => $item["id"],
                    ],
                ];
            });
        try {
            $items_return = [];
            DB::beginTransaction();
            foreach ($items as $item) {
                $res = ImportHelper::convertTime($fields, $item);
                $ma_lop = $res["ma"];
                $mssv = $res["mssv"];
                $lop = $lops[$ma_lop] ?? null;
                if (!$lop) {
                    return response()->json(
                        [
                            "message" => "Lớp $ma_lop không tồn tại trong dữ liệu",
                        ],
                        404
                    );
                }
                $sinh_vien = $sinh_viens[$mssv] ?? null;
                if (!$sinh_vien) {
                    return response()->json(
                        [
                            "message" => "Sinh viên $mssv không tồn tại trong dữ liệu",
                        ],
                        404
                    );
                }
                $sinh_vien_id = $sinh_vien["id"];
                $lop_id = $lop["id"];
                $items_return[] = [
                    "sinh_vien_id" => $sinh_vien_id,
                    "lop_id" => $lop_id,
                    "diem" => $res["diem"],
                    "loai" => "diem-lt-b-learning",
                ];
            }
            LopDiem::upsert($items_return, ["sinh_vien_id", "lop_id", "loai"], ["diem"]);
            DB::commit();
            return $this->responseSuccess($items_return);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }
}
