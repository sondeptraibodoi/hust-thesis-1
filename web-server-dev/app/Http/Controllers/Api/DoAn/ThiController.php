<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\BaiLam;
use App\Models\CauHoi;
use App\Models\ChiTietBaiLam;
use App\Models\ChiTietDeThi;
use App\Models\DapAn;
use App\Models\DeThi;
use App\Models\DeThiLop;
use App\Models\LopThi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ThiController extends Controller
{
    public function nopBai(Request $request)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
        ]);
        $lopId = $request->get('lop_id');
        $type = $request->get('type', 'kiem-tra');
        $answers = $validated['answers'];
        $monHocId = $request->input('mon_hoc_id');
        $userId = auth()->id();
        $baiThi = null;
        if ($type === 'kiem-tra' && $request->filled('de_thi_id')) {
            $deThi = DeThi::with('chiTietDeThis')->findOrFail($request->de_thi_id);
            $deChiTiet = $deThi->chiTietDeThis->keyBy('id');
            $cauHoiIds = $deChiTiet->pluck('cau_hoi_id')->toArray();

            $baiThi = BaiLam::create([
                'nguoi_dung_id' => $userId,
                'mon_hoc_id' => $monHocId,
                'de_thi_id' => $deThi->id,
                'created_at' => now(),
                'updated_at' => now(),
                'lop_thi_id' => $lopId
            ]);

            $cauHoiList = CauHoi::whereIn('id', $cauHoiIds)->get()->keyBy('id');
            $diemMoiCau = 10 / count($answers);
            $diemTong = 0;

            foreach ($answers as $deChiTietId => $dapAnNguoiDung) {
                $deLine = $deChiTiet[$deChiTietId] ?? null;
                if (!$deLine) continue;

                $cauHoi = $cauHoiList[$deLine->cau_hoi_id] ?? null;
                if (!$cauHoi) continue;

                $dung = $cauHoi->dap_an === $dapAnNguoiDung;
                if ($dung) $diemTong += $diemMoiCau;

                ChiTietBaiLam::create([
                    'bai_kiem_tra_id' => $baiThi->id,
                    'cau_hoi_id' => $deLine->cau_hoi_id,
                    'cau_tra_loi' => $dapAnNguoiDung,
                    'da_tra_loi' => true,
                    'dap_an_dung' => $dung,
                    'diem' => ceil($diemMoiCau),
                ]);
            }
            $cauTraLoiIds = array_keys($answers);
            $chuaTraLoi = collect($deChiTiet)->except($cauTraLoiIds);

            foreach ($chuaTraLoi as $deLine) {
                ChiTietBaiLam::create([
                    'bai_kiem_tra_id' => $baiThi->id,
                    'cau_hoi_id' => $deLine->cau_hoi_id,
                    'cau_tra_loi' => null,
                    'da_tra_loi' => false,
                    'dap_an_dung' => false,
                    'diem' => ceil($diemMoiCau),
                ]);
            }
            $baiThi->diem = $diemTong;
            $baiThi->save();
            if ($diemTong >= $deThi->diem_dat) {
                DB::table('level_mon_hoc')
                    ->updateOrInsert(
                        ['nguoi_dung_id' => $userId, 'mon_hoc_id' => $monHocId],
                        ['level' => DB::raw('CASE WHEN level < 10 THEN level + 1 ELSE level END')]
                    );
            }
        } elseif ($type === 'danh-gia' && $request->filled('de_thi_id')) {
            $deThi = DeThi::with('chiTietDeThis')->findOrFail($request->de_thi_id);
            $deChiTiet = $deThi->chiTietDeThis->keyBy('id');
            $cauHoiIds = $deChiTiet->pluck('cau_hoi_id')->toArray();

            $baiThi = BaiLam::create([
                'nguoi_dung_id' => $userId,
                'mon_hoc_id' => $monHocId,
                'de_thi_id' => $deThi->id,
                'created_at' => now(),
                'updated_at' => now(),
                'lop_thi_id' => $lopId
            ]);

            $cauHoiList = CauHoi::whereIn('id', $cauHoiIds)->get()->keyBy('id');

            $soCau = count($deChiTiet);
            $diemMoiCau = $soCau > 0 ? 10 / $soCau : 0;

            $diemBaiThi = 0;         // điểm hiển thị → 10 điểm
            $tongDiemDungTrongSo = 0; // điểm thật → để tính level
            $tongTrongSo = 0;

            foreach ($answers as $deChiTietId => $dapAnNguoiDung) {
                $deLine = $deChiTiet[$deChiTietId] ?? null;
                if (!$deLine) continue;

                $cauHoi = $cauHoiList[$deLine->cau_hoi_id] ?? null;
                if (!$cauHoi) continue;

                $trongSo = max(1, (int)round($cauHoi->do_kho));
                $tongTrongSo += $trongSo;

                $dung = strtoupper($cauHoi->dap_an) === strtoupper($dapAnNguoiDung);
                if ($dung) {
                    $diemBaiThi += $diemMoiCau;
                    $tongDiemDungTrongSo += $trongSo;
                }

                ChiTietBaiLam::create([
                    'bai_kiem_tra_id' => $baiThi->id,
                    'cau_hoi_id' => $cauHoi->id,
                    'cau_tra_loi' => $dapAnNguoiDung,
                    'da_tra_loi' => true,
                    'dap_an_dung' => $dung,
                    'diem' => ceil($diemMoiCau), // điểm hiển thị thôi
                ]);
            }

            // Câu chưa trả lời
            $cauTraLoiIds = array_keys($answers);
            $chuaTraLoi = collect($deChiTiet)->except($cauTraLoiIds);

            foreach ($chuaTraLoi as $deLine) {
                $cauHoi = $cauHoiList[$deLine->cau_hoi_id] ?? null;
                if (!$cauHoi) continue;

                $trongSo = max(1, (int)round($cauHoi->do_kho));
                $tongTrongSo += $trongSo;

                ChiTietBaiLam::create([
                    'bai_kiem_tra_id' => $baiThi->id,
                    'cau_hoi_id' => $cauHoi->id,
                    'cau_tra_loi' => null,
                    'da_tra_loi' => false,
                    'dap_an_dung' => false,
                    'diem' => ceil($diemMoiCau),
                ]);
            }
            $baiThi->diem = round($diemBaiThi, 2);
            $baiThi->save();
            $correctRateTrongSo = $tongTrongSo > 0 ? $tongDiemDungTrongSo / $tongTrongSo : 0;
            $level = max(1, ceil($correctRateTrongSo * 10));
            DB::table('level_mon_hoc')->updateOrInsert(
                ['nguoi_dung_id' => $userId, 'mon_hoc_id' => $monHocId],
                ['level' => $level]
            );
        }
        return $this->responseSuccess($baiThi);
    }

    public function cauHoiDanhGia(Request $request)
    {
        $deThi = DeThiLop::where('lop_thi_id', $request->lop_hoc_id)->where('level', 0)->first();
        if (empty($deThi)) {
            abort(400, 'Không có đề thi đánh giá nào. Vui lòng liên hệ với giáo viên phụ trách');
        }
        $deThi->load(['deThi.chiTietDeThis.cauHoi.dapAns', 'deThi.monHoc', 'deThi.chiTietDeThis.cauHoi' => function ($query) {
            $query->select('id', 'de_bai');
        }]);
        return $this->responseSuccess($deThi);
    }
}
