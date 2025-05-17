<?php

namespace App\Http\Controllers\Api\Lop;

use App\Helpers\DiemChuyenCanHelper;
use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use App\Models\User\SinhVien;
use DB;
use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;

class LopSinhVienExtrasController extends Controller
{
    protected $includes = ["lop", "sinhVien", "sinhVienExtras"];

    public function index($parent_lop_id, Request $request)
    {
        $lop_id = $request->get("lop_id");
        $query = Lop::query()->with([
            "sinhVienExtras" => function ($query) use ($lop_id) {
                $query->wherePivot("type", "khong_tinh_chuyen_can");
                $query->wherePivot("lop_id", $lop_id);
            },
        ]);
        $lop = $query->findOrFail($parent_lop_id);
        $sinhVienExtras = $lop->sinhVienExtras;
        $resource = [
            "ten_hp" => $lop["ten_hp"],
            "sinh_vien_extras" => $sinhVienExtras,
        ];
        return response()->json($resource, 200, []);
    }
    public function store(Request $request)
    {
        $request->validate(
            [
                "lop_id" => "required|int",
                "name" => "required|int",
                "parent_lop_id" => "required|int",
                "note" => "required|string",
            ],
            [
                "note.required" => "Trường ghi chú không được bỏ trống",
            ]
        );
        $lop_id = $request->input("lop_id");
        $sinh_vien_id = $request->input("name");
        $lop = Lop::findOrFail($lop_id);
        $result = DB::table("ph_lop_sinh_vien_extras")->insert([
            "lop_id" => $request->input("lop_id"),
            "sinh_vien_id" => $request->input("name"),
            "parent_lop_id" => $request->input("parent_lop_id"),
            "note" => $request->input("note"),
        ]);

        $diem_chuyen_can = DiemChuyenCanHelper::tinhDiem($lop, $sinh_vien_id, $lop_id);
        // Cập nhật trường 'diem'
        DB::table("ph_lop_sinh_viens")
            ->where("lop_id", $lop_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->update(["diem" => $diem_chuyen_can]);

        return $this->responseSuccess();
    }
    public function update(Request $request, $id)
    {
        $lop_id = $request->pivot["lop_id"];
        $parent_lop_id = $request->pivot["parent_lop_id"];
        $data = DB::table("ph_lop_sinh_vien_extras")
            ->where("lop_id", $lop_id)
            ->where("parent_lop_id", $parent_lop_id)
            ->where("sinh_vien_id", $id);
        if (!$data) {
            return $this->responseError("Không tìm thấy sinh viên trong lớp", 404);
        }
        $data->update([
            "note" => $request->input("note"),
        ]);
        return response()->json(["message" => "Cập nhật ghi chú thành công"], 200);
    }
    public function delete(Request $request)
    {
        $request->validate([
            "lop_id" => "required|int",
            "sinh_vien_id" => "required|int",
            "parent_lop_id" => "required|int",
        ]);
        $lop_id = $request->input("lop_id");
        $sinh_vien_id = $request->input("sinh_vien_id");
        $parent_lop_id = $request->input("parent_lop_id");
        $lop = Lop::findOrFail($lop_id);
        $data = DB::table("ph_lop_sinh_vien_extras")
            ->where("lop_id", $lop_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->where("parent_lop_id", $parent_lop_id);
        if (!$data) {
            return $this->responseError("Không tìm thấy sinh viên trong lớp", 404);
        }
        $data->delete();
        $diem_chuyen_can = DiemChuyenCanHelper::tinhDiem($lop, $sinh_vien_id, $lop_id);
        // Cập nhật trường 'diem'
        DB::table("ph_lop_sinh_viens")
            ->where("lop_id", $lop_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->update(["diem" => $diem_chuyen_can]);

        return $this->responseDeleted();
    }

    public function storeByMaHpAndMssv(Request $request)
    {
        $request->validate(
            [
                "ma_hp" => "required|string",
                "mssv" => "required|string",
                "note" => "required|string",
                "ki_hoc" => "required|string",
            ],
            [],
            [
                "note" => "ghi chú",
                "ma_hp" => "mã học phần",
                "mssv" => "mã số sinh viên",
            ]
        );

        $ma_hp = $request->input("ma_hp");
        $mssv = $request->input("mssv");
        $note = $request->input("note");
        $ki_hoc = $request->input("ki_hoc");

        $lop = Lop::where("ma_hp", $ma_hp)
            ->where("ki_hoc", $ki_hoc)
            ->where("loai", "!=", "LT")
            ->whereHas("sinhViens", function ($query) use ($mssv) {
                $query->where("mssv", $mssv);
            })
            ->first();

        if (empty($lop)) {
            return $this->responseError(404, "Mã học phần của lớp đã nhập không tồn tại trong kỳ học này.");
        }

        $sinhVien = SinhVien::where("mssv", $mssv)->first();

        if (!$sinhVien || !$lop) {
            return $this->responseError(
                404,
                "Không tìm thấy sinh viên với MSSV trong các lớp có mã học phần và ki học đã nhập."
            );
        }

        $result = DB::table("ph_lop_sinh_vien_extras")->updateOrInsert(
            [
                "lop_id" => $lop->id,
                "parent_lop_id" => $lop->id,
                "sinh_vien_id" => $sinhVien->id,
                "type" => "truot",
            ],
            [
                "note" => $note,
            ]
        );

        return $this->responseSuccess($result);
    }

    public function getTruotRecords(Request $request)
    {
        $query = DB::query()->fromSub(function ($query) {
            $query
                ->from("ph_lop_sinh_vien_extras")
                ->join("ph_lops", "ph_lop_sinh_vien_extras.lop_id", "=", "ph_lops.id")
                ->join("u_sinh_viens", "ph_lop_sinh_vien_extras.sinh_vien_id", "=", "u_sinh_viens.id")
                ->where("ph_lop_sinh_vien_extras.type", "truot");
            // $query->orderBy('ph_lop_sinh_vien_extras.id', 'desc');
            $query->select([
                "ph_lop_sinh_vien_extras.type",
                "ph_lop_sinh_vien_extras.parent_lop_id",
                "ph_lop_sinh_vien_extras.note",
                "u_sinh_viens.name",
                "u_sinh_viens.mssv",
                "u_sinh_viens.group",
                DB::raw("ph_lops.id as id_lop"),
                DB::raw("u_sinh_viens.id as sv_id"),
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
            ]);
        }, "truot_mons");
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->allowedSorts(["ki_hoc"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function updateTruotMon(Request $request, $id)
    {
        $lop_id = $request->id_lop;
        $data = DB::table("ph_lop_sinh_vien_extras")->where("lop_id", $lop_id)->where("sinh_vien_id", $id);
        if (!$data) {
            return $this->responseError("Không tìm thấy sinh viên trong lớp", 404);
        }
        $data->update([
            "note" => $request->input("note"),
        ]);
        return response()->json(["message" => "Cập nhật ghi chú thành công"], 200);
    }
}
