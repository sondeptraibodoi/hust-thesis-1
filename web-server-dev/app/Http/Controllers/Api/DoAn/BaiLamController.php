<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;
use App\Models\BaiLam;
use App\Models\DapAn;
use App\Http\Controllers\Controller;


class BaiLamController extends Controller
{

    public function index(Request $request)
    {
        $query = BaiLam::query()->when($request->has('user_id'), function ($q) use ($request) {
            $q->where('nguoi_dung_id', $request->get('user_id'));
        })
            ->with(['nguoiDung', 'deThi', 'monHoc']);
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedSearch(["code"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    //Xem bài làm của sinh viên đối với vai trò là admin/super_admin
    public function show($id)
    {
    $baiLam = BaiLam::with([
        'nguoiDung',
        'deThi',
        'chiTietBaiLams.cauHoi',
    ])->findOrFail($id);

    $chiTiet = $baiLam->chiTietBaiLams->map(function ($ct) {
        $cauHoi = $ct->cauHoi;

        $noiDung = json_decode($cauHoi->de_bai, true);
        $dapAnDung = strtoupper($cauHoi->dap_an); // A/B/C/D
        $dapAnChon = strtoupper($ct->cau_tra_loi); // từ chi_tiet_bai_lam

        return [
            'cau_hoi' => $noiDung['de_bai'] ?? '',
            'cac_dap_an' => [
                'A' => $noiDung['a'] ?? '',
                'B' => $noiDung['b'] ?? '',
                'C' => $noiDung['c'] ?? '',
                'D' => $noiDung['d'] ?? '',
            ],
            'dap_an_sinh_vien_chon' => $dapAnChon,
            'noi_dung_sv_chon' => $noiDung[strtolower($dapAnChon)] ?? null,
            'dap_an_dung' => $dapAnDung,
            'noi_dung_dung' => $noiDung[strtolower($dapAnDung)] ?? null,
            'dung_hay_sai' => $dapAnChon === $dapAnDung ? 'Đúng' : 'Sai',
        ];
    });

    return response()->json([
        'sinh_vien' => $baiLam->nguoiDung->ho_ten ?? 'Không rõ',
        'de_thi' => $baiLam->deThi->code ?? '',
        'diem' => $baiLam->diem ?? 0,
        'chi_tiet_cau_hoi' => $chiTiet,
    ]);
}
}
