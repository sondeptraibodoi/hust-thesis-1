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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ThiController extends Controller
{
    public function nopBai(Request $request)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $type = $request->get('type', 'kiem-tra');
        $answers = $validated['answers'];
        $monHocId = $request->input('mon_hoc_id');
        $userId = auth()->id();

        if ($type === 'kiem-tra' && $request->filled('de_thi_id')) {
            $deThi = DeThi::with('chiTietDeThis')->findOrFail($request->de_thi_id);
            $deChiTiet = $deThi->chiTietDeThis->keyBy('id');
            $cauHoiIds = $deChiTiet->pluck('cau_hoi_id')->toArray();

            $baiThi = BaiLam::create([
                'nguoi_dung_id' => $userId,
                'mon_hoc_id' => $monHocId,
                'de_thi_id' => $deThi->id,
                'created_at' => now(),
                'updated_at' => now()
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
            if ($diemTong >= $deThi->diem_dat) {
                DB::table('level_mon_hoc')
                    ->updateOrInsert(
                        ['nguoi_dung_id' => $userId, 'mon_hoc_id' => $monHocId],
                        ['level' => DB::raw('level + 1')]
                    );
            }
        } elseif ($type === 'danh-gia') {
            $questionIds = array_keys($answers);
            $questions = CauHoi::whereIn('id', $questionIds)->get();
            $totalScore = 0;
            $score = 0;

            foreach ($questions as $question) {
                $correct = strtoupper($question->dap_an);
                $userAnswer = strtoupper($answers[$question->id] ?? '');
                $weight = (int)($question->do_kho ?: 1);

                $totalScore += $weight;
                if ($userAnswer === $correct) {
                    $score += $weight;
                }
            }

            $correctRate = $totalScore > 0 ? $score / $totalScore : 0;
            $level = max(1, ceil($correctRate * 10));

            DB::table('level_mon_hoc')->updateOrInsert(
                ['nguoi_dung_id' => $userId, 'mon_hoc_id' => $monHocId],
                ['level' => $level]
            );
        }

        return $this->responseSuccess();
    }

    public function cauHoiDanhGia(Request $request)
    {
        $monHocId = $request->input('mon_hoc_id');
        $list = CauHoi::where('mon_hoc_id', $monHocId)->inRandomOrder()->limit(5)->get();
        return $this->responseSuccess($list);
    }
}
