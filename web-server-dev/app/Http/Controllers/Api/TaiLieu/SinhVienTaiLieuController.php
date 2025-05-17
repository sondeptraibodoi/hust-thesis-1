<?php

namespace App\Http\Controllers\Api\TaiLieu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Lop\Lop;
use App\Models\HocPhan\HocPhanChuong;
use App\Models\TaiLieu\TlTaiLieu;

class SinhVienTaiLieuController extends Controller
{
    public function listTaiLieuSV($lopId)
    {
        $maHp = Lop::findOrFail($lopId)->ma_hp;

        $taiLieus = TlTaiLieu::with("loaiTaiLieu")
            ->whereHas("lops", function ($query) use ($lopId) {
                $query->where("lop_id", $lopId);
            })
            ->orWhereHas("hocPhans", function ($query) use ($maHp) {
                $query->where("ma_hoc_phan", $maHp);
            })
            ->where("trang_thai", "1-Đang sử dụng")
            ->get();

        return $taiLieus;
    }

    public function listHocPhanChuong(Request $request)
    {
        $query = HocPhanChuong::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedSearch([])
            ->allowedAgGrid([])
            ->defaultSort("ten")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
}
