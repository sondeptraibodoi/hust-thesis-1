<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use Illuminate\Http\Request;
use App\Models\NguoiDung;
use App\Models\BaiLam;
use DB;

class ThongKeController extends Controller
{
    public function chartDiemThongKe(Request $request)
    {
        $monHocId = $request->input('mon_hoc_id');

        // ===== Lấy dữ liệu bài làm theo điểm =====
        $query = BaiLam::query();
        if ($monHocId) {
            $query->where('mon_hoc_id', $monHocId);
        }

        $rawDiem = $query->select('diem', DB::raw('COUNT(*) as count'))
            ->whereBetween('diem', [0, 10])
            ->groupBy('diem')
            ->orderBy('diem')
            ->pluck('count', 'diem');

        $diemTu1Den10 = collect(range(0, 10))->mapWithKeys(fn($diem) => [$diem => $rawDiem->get($diem, 0)]);
        $dataDiem = [
            'labels' => $diemTu1Den10->keys()->map(fn($diem) => $diem . ' điểm'),
            'datasets' => [[
                'label' => 'Số bài',
                'data' => $diemTu1Den10->values(),
                'backgroundColor' => [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#8B5CF6',
                    '#22C55E',
                    '#E11D48',
                    '#0EA5E9',
                    '#F32F0E'
                ]
            ]]
        ];

        // ===== Thống kê số câu hỏi theo độ khó =====
        $queryCauHoi = \App\Models\CauHoi::query();
        if ($monHocId) {
            $queryCauHoi->where('mon_hoc_id', $monHocId);
        }

        $rawCauHoi = \App\Models\CauHoi::when($monHocId, fn($q) => $q->where('mon_hoc_id', $monHocId))
            ->select('do_kho', DB::raw('COUNT(*) as count'))
            ->groupBy('do_kho')
            ->pluck('count', 'do_kho');

        $mucDoKho = collect(range(1, 10))->mapWithKeys(function ($level) {
            return [$level => 'Mức ' . $level];
        });

        $cauHoiTheoDoKho = $mucDoKho->mapWithKeys(
            fn($label, $key) => [$label => $rawCauHoi->get($key, 0)]
        );

        $dataCauHoi = [
            'labels' => $cauHoiTheoDoKho->keys(),     // ["Mức 1", "Mức 2", ..., "Mức 10"]
            'datasets' => [[
                'label' => 'Số câu hỏi',
                'data' => $cauHoiTheoDoKho->values(), // [5, 10, 12, 8, ...]
                'backgroundColor' => [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#8B5CF6',
                    '#22C55E',
                    '#E11D48',
                    '#0EA5E9',
                    '#F32F0E'
                ]          // Tùy bạn thêm 10 màu
            ]]
        ];

        // ===== Thống kê số người đã làm bài =====
        $tongNguoi = User::where('vai_tro', 'sinh_vien')->count();
        $nguoiDaLam = BaiLam::when($monHocId, fn($q) => $q->where('mon_hoc_id', $monHocId))
            ->distinct('nguoi_dung_id')->count('nguoi_dung_id');

        $nguoiChuaLam = max(0, $tongNguoi - $nguoiDaLam);

        $dataNguoiLamBai = [
            'labels' => ['Đã làm', 'Chưa làm'],
            'datasets' => [[
                'label' => 'Người dùng',
                'data' => [$nguoiDaLam, $nguoiChuaLam],
                'backgroundColor' => ['#00C853', '#D50000']
            ]]
        ];
        // level theo môn học

        $query = DB::table('level_mon_hoc')
        ->join('nguoi_dung', 'nguoi_dung.id', '=', 'level_mon_hoc.nguoi_dung_id')
        ->select('nguoi_dung.ho_ten', 'level_mon_hoc.level');

    if ($monHocId) {
        $query->where('level_mon_hoc.mon_hoc_id', $monHocId);
    }

    $data = $query->orderBy('level_mon_hoc.level', 'desc')->get();

    // Định dạng cho Chart.js
    $level = [
        'labels' => $data->pluck('ho_ten'),       // Tên người dùng
        'datasets' => [
            [
                'label' => 'Level',
                'data' => $data->pluck('level'),  // Mức level tương ứng
                'backgroundColor' => '#36A2EB',
            ]
        ]
    ];

        return response()->json([
            'diem_thi' => $dataDiem,
            'so_cau_hoi' => $dataCauHoi,
            'so_nguoi_lam_bai' => $dataNguoiLamBai,
            'level' => $level
        ]);
    }
}
