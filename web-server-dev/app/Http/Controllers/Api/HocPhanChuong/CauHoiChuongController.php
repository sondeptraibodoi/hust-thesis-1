<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Constants\RoleCode;
use App\Enums\LoaiBaiThi;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanChuong;
use App\Traits\ResponseType;
use DB;
use Illuminate\Http\Request;

class CauHoiChuongController extends Controller
{
    use ResponseType;
    public function index(Request $request, $cau_hoi_id)
    {
        $query = HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id);
        $query = QueryBuilder::for($query, $request)
            ->allowedSorts([])
            ->allowedAgGrid([])
            ->allowedFilters([])
            ->defaultSort("chuong_id")
            ->allowedIncludes("cauHoi", "chuong")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function store(Request $request, $cau_hoi_id)
    {
        $request->validate(
            [
                "ma_hoc_phan" => [
                    "required",
                    function ($attribute, $value, $fail) use ($cau_hoi_id) {
                        $exists = HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id)
                            ->where("ma_hoc_phan", $value)
                            ->exists();
                        if ($exists) {
                            $fail("Câu hỏi đã được gán với chủ đề của mã học phần này");
                        }
                    },
                    function ($attribute, $value, $fail) use ($request) {
                        $user = $request->user();
                        if (!$user->allow(RoleCode::ASSISTANT)) {
                            $hoc_phan_quan_lys = $user->hocPhanQuanLy->pluck("ma_hoc_phan")->toArray();
                            if (!in_array($value, $hoc_phan_quan_lys)) {
                                $fail("Học phần không thuộc diện quản lý");
                            }
                        }
                    },
                ],
                "chuong_id" => ["required"],
                "do_kho" => ["required"],
            ],
            [],
            [
                "chuong_id" => "chủ đề",
                "do_kho" => "độ khó",
            ]
        );
        $data = $request->all();
        $chuong = HocPhanChuong::findOrFail($data["chuong_id"]);
        $cau_hoi = HocPhanCauHoi::findOrFail($cau_hoi_id);
        HocPhanCauHoiChuong::create([
            "ma_hoc_phan" => $chuong["ma_hoc_phan"],
            "cau_hoi_id" => $cau_hoi_id,
            "chuong_id" => $data["chuong_id"],
            "do_kho" => $data["do_kho"],
        ]);
        return $this->responseCreated();
    }
    public function destroy(Request $request, $cau_hoi_id, $chuong_id)
    {
        $user = $request->user();
        if (!$user->allow(RoleCode::ASSISTANT)) {
            $hoc_phan_quan_lys = $user->hocPhanQuanLy->pluck("ma_hoc_phan")->toArray();
            $chuong = HocPhanChuong::findOrFail($chuong_id);
            if (!in_array($chuong->ma_hoc_phan, $hoc_phan_quan_lys)) {
                abort(400, "Học phần không thuộc diện quản lý");
            }
        }
        $is_thi = HocPhanBaiThiCauHoi::where("cau_hoi_id", $cau_hoi_id)
            ->whereHas("baiThi", function ($query) use ($chuong_id) {
                $query->where("loai", LoaiBaiThi::THAT);
                $query->where("chuong_id", $chuong_id);
            })
            ->exists();
        if ($is_thi) {
            abort(400, "Câu hỏi đã thi");
        }
        $cau_hoi = HocPhanCauHoi::findOrFail($cau_hoi_id);
        $chuong = HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id)->where("chuong_id", $chuong_id)->firstOrFail();
        if ($chuong->is_primary) {
            abort(400, "Không thế xóa học phần chính");
        }
        HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id)->where("chuong_id", $chuong_id)->delete();
        return $this->responseDeleted();
    }
    public function makePrimary(Request $request, $cau_hoi_id, $chuong_id)
    {
        $cau_hoi = HocPhanCauHoi::findOrFail($cau_hoi_id);
        $chuong = HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id)->where("chuong_id", $chuong_id)->firstOrFail();
        if ($chuong->is_primary) {
            return $this->responseUpdated();
        }
        return DB::transaction(function () use ($cau_hoi_id, $chuong_id) {
            HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id)->update(["is_primary" => false]);
            HocPhanCauHoiChuong::where("cau_hoi_id", $cau_hoi_id)
                ->where("chuong_id", $chuong_id)
                ->update(["is_primary" => true]);
            return $this->responseUpdated();
        });
    }
}
