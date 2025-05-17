<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Http\Controllers\Controller;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanChuong;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class HocPhanCauHoiChuongController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getCauHoiChuong(Request $request)
    {
        $maHocPhan = $request->input("ma_hoc_phan");
        $chuongId = $request->input("chuong_id");

        if (!$maHocPhan || !$chuongId) {
            return response()->json(["message" => "ma_hoc_phan and chuong_id are required"], 400);
        }

        $cauHoiData = HocPhanCauHoiChuong::with(["cauHoi.createdBy", "chuong"])
            ->where("ma_hoc_phan", $maHocPhan)
            ->where("chuong_id", $chuongId)
            ->get();

        return response()->json($cauHoiData);
    }

    public function store(Request $request)
    {
        $request->validate([
            "noi_dung" => "required|string|max:255",
            "lua_chon" => "required|array",
            "dap_an" => "required|array",
            "ma_hoc_phan" => "required|string",
            "chuong_id" => "required|integer",
        ]);

        $user_id = $request->user()->id;

        try {
            \DB::beginTransaction();

            $loai = count($request->input("dap_an")) === 1 ? "single" : "multi";

            $cauHoi = HocPhanCauHoi::create([
                "noi_dung" => $request->input("noi_dung"),
                "loai" => $loai,
                "lua_chon" => json_encode($request->input("lua_chon")),
                "dap_an" => json_encode($request->input("dap_an")),
                "created_by_id" => $user_id,
            ]);

            HocPhanCauHoiChuong::create([
                "ma_hoc_phan" => $request->input("ma_hoc_phan"),
                "cau_hoi_id" => $cauHoi->id,
                "chuong_id" => $request->input("chuong_id"),
            ]);

            \DB::commit();

            return response()->json(["message" => "Câu hỏi được tạo thành công"], 201);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json(["error" => "Có lỗi xảy ra: " . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            "noi_dung" => "required|string",
            "lua_chon" => "required|array",
            "dap_an" => "required|array",
            "ma_hoc_phan" => "required|string",
            "chuong_id" => "required|integer",
        ]);

        $user_id = $request->user()->id;

        try {
            \DB::beginTransaction();
            $cauHoi = HocPhanCauHoi::findOrFail($id);

            $cauHoi->update([
                "noi_dung" => $request->input("noi_dung"),
                "loai" => count($request->input("dap_an")) === 1 ? "single" : "multi",
                "lua_chon" => json_encode($request->input("lua_chon")),
                "dap_an" => json_encode($request->input("dap_an")),
                "created_by_id" => $user_id,
            ]);

            $hocPhanCauHoiChuong = HocPhanCauHoiChuong::where("cau_hoi_id", $id)->firstOrFail();
            $hocPhanCauHoiChuong->update([
                "ma_hoc_phan" => $request->input("ma_hoc_phan"),
                "chuong_id" => $request->input("chuong_id"),
            ]);

            \DB::commit();

            return response()->json(["message" => "Câu hỏi được cập nhật thành công"], 200);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json(["error" => "Có lỗi xảy ra: " . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $cauHoi = HocPhanCauHoi::findOrFail($id);
        HocPhanCauHoiChuong::where("cau_hoi_id", $id)->delete();
        $cauHoi->delete();
        return response()->json(["message" => "Xóa câu hỏi thành công"], 200);
    }
}
