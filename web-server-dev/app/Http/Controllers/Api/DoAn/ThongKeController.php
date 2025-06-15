<?php
namespace App\Http\Controllers\Api\DoAn;
use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use App\Models\BaiLam;

class ThongKeController extends Controller
{
    public function dashboard()
    {
        $sinhVienIds = NguoiDung::where('vai_tro', 'sinh_vien')->pluck('nguoi_dung_id');

        // Tổng số sinh viên đã làm bài
        $soSinhVienDaLamBai = BaiLam::whereIn('nguoi_dung_id', $sinhVienIds)
                                    ->distinct('nguoi_dung_id')
                                    ->count('nguoi_dung_id');

        // Số sinh viên làm bài được > 5 điểm
        $sinhVienTren5 = BaiLam::whereIn('nguoi_dung_id', $sinhVienIds)
                                ->where('diem', '>', 5)
                                ->distinct('nguoi_dung_id')
                                ->count('nguoi_dung_id');

        // Số sinh viên làm bài được < 5 điểm
        $sinhVienDuoi5 = BaiLam::whereIn('nguoi_dung_id', $sinhVienIds)
                                ->where('diem', '<', 5)
                                ->distinct('nguoi_dung_id')
                                ->count('nguoi_dung_id');

        // Số sinh viên đạt điểm 10 
        $sinhVienDiemTuyetDoi = BaiLam::whereIn('nguoi_dung_id', $sinhVienIds)
                                       ->where('diem', 10)
                                       ->distinct('nguoi_dung_id')
                                       ->count('nguoi_dung_id');

        return response()->json([
            'sinh_vien_da_lam_bai' => $soSinhVienDaLamBai,
            'sinh_vien_tren_5_diem' => $sinhVienTren5,
            'sinh_vien_duoi_5_diem' => $sinhVienDuoi5,
            'sinh_vien_diem_tuyet_doi' => $sinhVienDiemTuyetDoi,
        ]);
    }
}