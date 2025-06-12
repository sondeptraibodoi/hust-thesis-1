<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BaiLam;
use App\Models\DapAn;


class BaiLamController extends Controller
{
    //Xem bài làm của sinh viên đối với vai trò là admin/super_admin
    public function chiTietBaiLam($baiLamId)
    {
        $baiLam = BaiLam::with([
            'nguoiDung',
            'deThi',
            'chiTietBaiLam.cauHoi',
            'chiTietBaiLam.dapAnChon',
        ])->findOrFail($baiLamId);

        $chiTiet = $baiLam->chiTietBaiLam->map(function ($ct) {
            $dapAnDung = DapAn::where('cau_hoi_id', $ct->cau_hoi_id)->where('la_dap_an_dung', 1)->first();
            return [
                'cau_hoi' => $ct->cauHoi->noi_dung ?? null,
                'dap_an_sinh_vien_chon' => $ct->dapAnChon->noi_dung ?? null,
                'dap_an_dung' => $dapAnDung->noi_dung ?? null,
                'dung_hay_sai' => $ct->dung_hay_sai ? 'Đúng' : 'Sai',
            ];
        });

        return response()->json([
            'sinh_vien' => $baiLam->nguoiDung->ho_ten,
            'de_thi' => $baiLam->deThi->ten_de,
            'diem' => $baiLam->diem,
            'chi_tiet_cau_hoi' => $chiTiet,
        ]);
    }
}
