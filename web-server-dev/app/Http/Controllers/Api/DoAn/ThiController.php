<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\BaiLam;
use App\Models\CauHoi;
use App\Models\ChiTietBaiLam;
use App\Models\ChiTietDeThi;
use App\Models\DapAn;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ThiController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Truy cập dashboard thành công',
            'user' => Auth::user(),
        ], 200);
    }

    public function batDauLamBai(Request $request)
    {
        $request->validate([
            'de_thi_id' => 'required|integer',
            'nguoi_dung_id' => 'required|integer',
        ]);

        $baiLam = BaiLam::create([
            'de_thi_id' => $request->de_thi_id,
            'nguoi_dung_id' => $request->nguoi_dung_id,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Khởi tạo bài làm thành công',
            'bai_lam_id' => $baiLam->bai_lam_id,
        ]);
    }

    // 2. Lưu từng câu trả lời
    public function traLoiCauHoi(Request $request)
    {
        $request->validate([
            'bai_lam_id' => 'required|integer',
            'cau_hoi_id' => 'required|integer',
            'dap_an_id' => 'required|integer',
        ]);

        $dapAn = DapAn::find($request->dap_an_id);
        if (!$dapAn || $dapAn->cau_hoi_id != $request->cau_hoi_id) {
            return response()->json(['error' => 'Đáp án không hợp lệ'], 400);
        }

        ChiTietBaiLam::updateOrCreate(
            [
                'bai_lam_id' => $request->bai_lam_id,
                'cau_hoi_id' => $request->cau_hoi_id,
            ],
            [
                'dap_an_id' => $request->dap_an_id,
                'dung_hay_sai' => $dapAn->la_dap_an_dung ? 1 : 0,
                'created_at' => now(),
            ]
        );

        return response()->json(['message' => 'Lưu câu trả lời thành công']);
    }

    // 3. Nộp bài => tính điểm
    public function nopBai(Request $request)
    {
        $type = $request->get('type', 'kiem-tra');
        $query = $request->all();
        // $answers = $request->get('answers');
        // $diem = 0;
        // foreach ($answers as $key => $value) {
        //     dd($value, $key);
        //     # code...
        // }

        // $baiLam = BaiLam::findOrFail($request->bai_lam_id);

        // $tongCau = ChiTietDeThi::where('de_thi_id', $baiLam->de_thi_id)->count();
        // $soCauDung = ChiTietBaiLam::where('bai_lam_id', $baiLam->bai_lam_id)
        //     ->where('dung_hay_sai', 1)
        //     ->count();

        // $diem = round(($soCauDung / $tongCau) * 10, 2); // tính điểm theo thang 10

        // $baiLam->update([
        //     'diem' => $diem,
        //     'thoi_gian_nop' => now(),
        // ]);

        // return response()->json([
        //     'message' => 'Nộp bài thành công',
        //     'diem' => $diem,
        //     'so_cau_dung' => $soCauDung,
        //     'tong_so_cau' => $tongCau,
        // ]);
        $validated = $request->validate([
            'answers' => 'required|array'
        ]);

        $answers = $validated['answers'];
        $questionIds = array_keys($answers);
        $questions = CauHoi::whereIn('id', $questionIds)->get();
        $totalQuestions = count($questions);
        $correctCount = 0;

        $totalScore = 0;
        $score = 0;

        foreach ($questions as $question) {
            $correctAnswer = strtoupper($question->dap_an);
            $studentAnswer = strtoupper($answers[$question->id] ?? '');

            $weight = (int) $question->do_kho ?: 1;

            $totalScore += $weight;

            if ($studentAnswer === $correctAnswer) {
                $correctCount++;
                $score += $weight;
            }
        }
        $correctRate = $totalScore > 0 ? $score / $totalScore : 0;
        $level = max(1, ceil($correctRate * 10));
        if ($type === 'danh-gia') {
            DB::table('level_mon_hoc')->insert([
                'nguoi_dung_id' => auth()->user()->id,
                'level' => $level,
                'mon_hoc_id' => $query['mon_hoc_id']
            ]);
        }
    }

    public function cauHoiDanhGia(Request $request)
    {
        $monHocId = $request->input('mon_hoc_id');
        $list = CauHoi::where('mon_hoc_id', $monHocId)->inRandomOrder()->limit(5)->get();
        return $this->responseSuccess($list);
    }
}
