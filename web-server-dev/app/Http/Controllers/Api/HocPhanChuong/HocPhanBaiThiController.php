<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\LoaiBaiThi;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Diem\DiemHocPhanChuong;
use DB;
use Illuminate\Http\Request;

class HocPhanBaiThiController extends Controller
{
    public function index(Request $request)
    {
        $query = HocPhanBaiThi::query();
        $query = DB::query()->fromSub(function ($query) {
            $query
                ->from("hp_bai_this")
                ->join("ph_lops", "hp_bai_this.lop_id", "=", "ph_lops.id")
                ->join("hp_chuongs", "hp_bai_this.chuong_id", "=", "hp_chuongs.id")
                ->join("u_sinh_viens", "hp_bai_this.sinh_vien_id", "=", "u_sinh_viens.id")
                ->select([
                    "hp_bai_this.id",
                    "ph_lops.ma_hp",
                    DB::raw("ph_lops.id as lop_id"),
                    DB::raw("ph_lops.ki_hoc as ki_hoc"),
                    DB::raw("u_sinh_viens.id as sinh_vien_id"),
                    DB::raw("hp_chuongs.stt as chuong_stt"),
                    "hp_chuongs.ten",
                    "u_sinh_viens.mssv",
                    "u_sinh_viens.name",
                    "hp_bai_this.bat_dau_thi_at",
                    "hp_bai_this.ket_thuc_thi_at",
                    "hp_bai_this.thoi_gian_thi_cho_phep",
                    "hp_bai_this.loai",
                    "hp_bai_this.diem",
                ]);
            $query->where("hp_bai_this.loai", LoaiBaiThi::THAT);
        }, "bai_thi");
        $query->orderBy("id", "desc");

        $query = QueryBuilder::for($query, $request)
            ->allowedSearch(["ma_hp"])
            ->allowedAgGrid([])
            ->allowedFilters("ma_hp")
            ->allowedSorts(["id"])
            ->defaultSort("id")
            ->allowedPagination();

        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function showBaiThi($id)
    {
        $baiThi = HocPhanBaiThi::with([
            "baiThiCauHoi" => function ($query) {
                $query->orderBy("order", "asc");
            },
            "sinhVien" => function ($query) {
                $query->select("id", "name", "mssv", "email");
            },
            "chuong" => function ($query) {
                $query->select("id", "stt", "ten", "ma_hoc_phan");
            },
        ])->findOrFail($id);
        return $baiThi;
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $model = HocPhanBaiThi::findOrFail($id);
            HocPhanBaiThiCauHoi::where("bai_thi_id", $id)->delete();
            $result = $model->delete();
            if ($model->loai == LoaiBaiThi::THAT && $model->sinh_vien_id && $model->chuong_id && $model->lop_id) {
                DiemHocPhanChuong::where("sinh_vien_id", $model->sinh_vien_id)
                    ->where("chuong_id", $model->chuong_id)
                    ->where("lop_id", $model->lop_id)
                    ->delete();
            }
            return $this->responseSuccess($model);
        });
    }
}
