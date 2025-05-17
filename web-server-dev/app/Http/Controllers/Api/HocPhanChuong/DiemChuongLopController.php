<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\LoaiThi;
use App\Helpers\DiemQTBuilder;
use App\Helpers\DiemQTBuilderMulti;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\Diem\DiemHocPhanChuongView;
use App\Models\Lop\Lop;
use DB;
use Request;

class DiemChuongLopController extends Controller
{
    public function thongKe($id)
    {
        $lop = Lop::with("sinhViens")->findOrFail($id);
        $handle = new DiemQTBuilder($lop);

        $handle->init();
        $data = $lop->sinhViens
            ->map(function ($item) use (&$diems_lop, $lop, $handle) {
                $sinh_vien_id = $item["id"];
                $diem = $handle->getDiem($sinh_vien_id);
                unset($diem["thong_tin"]);
                $item["diem"] = $diem;
                return $item;
            })
            ->toArray();
        return $data;
    }
    public function index($id)
    {
        $query = DiemHocPhanChuongView::query()
            ->whereHas("lop", function ($query) {
                $query->where("loai_thi", LoaiThi::Thi_Theo_Chuong);
            })
            ->where("lop_id", $id);

        $query
            ->select(
                "lop_id",
                "sinh_vien_id",
                DB::raw("count(sinh_vien_id) AS count_diem"),
                DB::raw("sum(diem) AS sum_diem")
            )
            ->groupBy("sinh_vien_id", "lop_id")
            ->orderBy("sinh_vien_id")
            ->with([
                "lop" => function ($query) {
                    $query->select("id", "ma_hp", "ten_hp");
                },
                "sinhVien" => function ($query) {
                    $query->select("id", "mssv", "name", "email");
                },
                "sinhVien.diemHocPhanChuong" => function ($query) use ($id) {
                    $query->select("id", "diem", "lop_id", "chuong_id", "sinh_vien_id")->where("lop_id", $id);
                },
                "sinhVien.diemHocPhanChuong.chuong" => function ($query) {
                    $query->select(
                        "id",
                        "ten",
                        "stt",
                        "tuan_mo",
                        "tuan_dong",
                        "thoi_gian_thi",
                        "thoi_gian_doc",
                        "so_cau_hoi",
                        "diem_toi_da"
                    );
                },
            ]);
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function show($id)
    {
        $query = DiemHocPhanChuongView::query()
            ->where("lop_id", $id)
            ->whereHas("lop", function ($query) {
                $query->where("loai_thi", LoaiThi::Thi_Theo_Chuong);
            });
        $query
            ->select(
                "chuong_id",
                DB::raw("ROUND(AVG(CAST(diem AS numeric)),2) AS tb_diem"),
                DB::raw("count(*) AS count_diem")
            )
            ->groupBy("chuong_id")
            ->orderBy("chuong_id")
            ->with([
                "chuong" => function ($query) {
                    $query->select(
                        "id",
                        "ten",
                        "tuan_mo",
                        "tuan_dong",
                        "so_cau_hoi",
                        "diem_toi_da",
                        "thoi_gian_thi",
                        "thoi_gian_doc"
                    );
                },
            ]);

        $results = $query->get();
        return response()->json(new \App\Http\Resources\Items($results), 200, []);
    }
}
