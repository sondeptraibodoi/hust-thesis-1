<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\TrangThaiCauHoi;
use App\Http\Controllers\Controller;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiPhanBien;
use DB;
use Illuminate\Http\Request;

class TroLyCauHoiDetailController extends Controller
{
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role_code;

        $query = HocPhanCauHoi::query()
            ->where("id", $id)
            ->where("trang_thai", "!=", TrangThaiCauHoi::MoiTao);

        if (!in_array($role, ["assistant", "hp_assistant"]) && strpos($role, "assistant") === false) {
            $hp_user = DB::table("hp_user")
                ->where("user_id", $user->id)
                ->groupBy("user_id", "ma_hoc_phan")
                ->pluck("ma_hoc_phan");

            $query->whereHas("primaryChuong", function ($q) use ($hp_user) {
                $q->whereIn("ma_hoc_phan", $hp_user);
            });
        }

        $query = $query
            ->with([
                "primaryChuong.chuong",
                "primaryChuong.maHp",
                "primaryChuong.loaiThi",
                "createdBy" => function ($q) {
                    $q->select("id", "username", "info_id", "info_type");
                },
                "createdBy.info" => function ($q) {
                    $q->select(["id", "name"]);
                },
                "cauHoiPhanBien" => function ($q) {
                    $q->select([
                        "id",
                        "cau_hoi_id",
                        "giao_vien_id",
                        "ngay_han_phan_bien",
                        "trang_thai_cau_hoi",
                        "ly_do",
                    ]);
                    $q->orderBy("id", "desc");
                    $q->limit(1);
                },
                "cauHoiPhanBien.giaoVien" => function ($q) {
                    $q->select(["id", "name"]);
                },
            ])
            ->first();

        return response()->json($query, 200, []);
    }

    public function listPhanBien($id, Request $request)
    {
        $onlyMe = $request->boolean("onlyMe");
        $query = HocPhanCauHoiPhanBien::query()->where("cau_hoi_id", $id)->orderBy("id", "desc");
        if ($onlyMe) {
            $user = $request->user();
            $query->where("giao_vien_id", $user->info_id);
        }
        $query->with(["giaoVien"]);
        return $query->get();
    }
}
