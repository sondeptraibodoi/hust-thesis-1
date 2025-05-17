<?php

namespace App\Http\Controllers\Api\Lop;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use DB;
use Illuminate\Http\Request;

class LopSinhVienGiaoVienPhanBienController extends Controller
{
    public function listSinhVienPhanBien(Request $request)
    {
        $user = $request->user();
        $gv_id = $user->info_id;

        if (!$user->allow(RoleCode::TEACHER)) {
            abort(403);
        }

        $query = DB::query()->fromSub(function ($query) use ($gv_id) {
            $query
                ->from("ph_lop_sinh_vien_giao_vien_phan_bien")
                ->where("ph_lop_sinh_vien_giao_vien_phan_bien.giao_vien_id", $gv_id)
                ->join("u_sinh_viens", "ph_lop_sinh_vien_giao_vien_phan_bien.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lops", "ph_lop_sinh_vien_giao_vien_phan_bien.lop_id", "=", "ph_lops.id")
                ->select([
                    "ph_lop_sinh_vien_giao_vien_phan_bien.lop_id",
                    "ph_lop_sinh_vien_giao_vien_phan_bien.sinh_vien_id",
                    "ph_lops.ma",
                    "ph_lops.ma_hp",
                    "ph_lops.ten_hp",
                    "ph_lops.ki_hoc",
                    "u_sinh_viens.mssv",
                    DB::raw("u_sinh_viens.name as sinh_vien"),
                ])
                ->orderBy("ph_lop_sinh_vien_giao_vien_phan_bien.sinh_vien_id");
        }, "phan_bien");

        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->allowedSorts(["ki_hoc"])
            ->defaultSort("-ki_hoc")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
}
