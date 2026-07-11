<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use App\Models\GiaoVienLop;

class GiaoVienLopController extends Controller
{
    public function getMaHp()
    {
        $items = GiaoVienLop::query()
            ->with('lopThi.monHoc')
            ->get()
            ->map(function ($item) {
                return [
                    'giao_vien_id' => $item->giao_vien_id,
                    'lop_thi_id' => $item->lop_thi_id,
                    'ma_mon_hoc' => optional(optional($item->lopThi)->monHoc)->ma,
                    'ten_mon_hoc' => optional(optional($item->lopThi)->monHoc)->ten_mon_hoc,
                ];
            })
            ->unique(fn ($item) => $item['giao_vien_id'] . '-' . $item['ma_mon_hoc'])
            ->values();

        return $this->responseSuccess($items);
    }
}
