<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HocKy;

class GetKiHienGioController extends Controller
{
    public function kiHoc()
    {
        return $this->responseSuccess(
            HocKy::query()
                ->where('trang_thai', 'dang_dien_ra')
                ->orWhere('dang_mo_dang_ky', true)
                ->orderByDesc('nam_hoc')
                ->orderByDesc('hoc_ky_so')
                ->first()
        );
    }

    public function index()
    {
        return $this->responseSuccess([
            'hoc_ky_hien_gio' => HocKy::query()
                ->orderByDesc('nam_hoc')
                ->orderByDesc('hoc_ky_so')
                ->first(),
        ]);
    }
}
