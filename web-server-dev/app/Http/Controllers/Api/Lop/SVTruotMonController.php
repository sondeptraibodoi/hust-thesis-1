<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use DB;
use Illuminate\Http\Request;

class SVTruotMonController extends Controller
{
    public function index(Request $request, $id)
    {
        $query = Lop::query()->with([
            "sinhVienExtras" => function ($query) {
                $query->wherePivot("type", "truot");
            },
        ]);
        $lop = $query->findOrFail($id);
        $sinhVienExtras = $lop->sinhVienExtras;
        $result = [
            "ten_hp" => $lop["ten_hp"],
            "sinhVienExtras" => $sinhVienExtras,
        ];
        return response()->json($result, 200, []);
    }
    public function store(Request $request)
    {
        $request->validate(
            [
                "lop_id" => "required|int",
                "name" => "required|int",
                "note" => "required|string",
            ],
            [
                "note.required" => "Trường ghi chú không được bỏ trống",
            ]
        );
        $result = DB::table("ph_lop_sinh_vien_extras")->insert([
            "lop_id" => $request->input("lop_id"),
            "sinh_vien_id" => $request->input("name"),
            "note" => $request->input("note"),
            "type" => "truot",
        ]);
        return $this->responseSuccess($result);
    }
    public function update(Request $request, $id)
    {
        $lop_id = $request->pivot["lop_id"];
        $type = $request->pivot["type"];
        $data = DB::table("ph_lop_sinh_vien_extras")
            ->where("lop_id", $lop_id)
            ->where("sinh_vien_id", $id)
            ->where("type", $type);
        if (!$data) {
            return $this->responseError("Không tìm thấy sinh viên trong lớp", 404);
        }
        $data->update([
            "note" => $request->input("note"),
        ]);
        return response()->json(["message" => "Cập nhật ghi chú thành công"], 200);
    }
    public function delete(Request $request, $id)
    {
        $lop_id = $request->input("id");
        $sinh_vien_id = $request->input("sinh_vien_id");
        $type = $request->input("type");
        $data = DB::table("ph_lop_sinh_vien_extras")
            ->where("lop_id", $lop_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->where("type", $type);
        if (!$data) {
            return $this->responseError("Không tìm thấy sinh viên trong lớp", 404);
        }
        $data->delete();
        return response()->json(["message" => "Xóa sinh viên thành công"], 200);
    }
}
