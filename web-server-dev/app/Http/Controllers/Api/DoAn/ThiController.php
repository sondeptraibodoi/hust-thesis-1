<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\BaiLam;
use App\Models\ChiTietBaiLam;
use App\Models\ChiTietDeThi;
use App\Models\DapAn;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ThiController extends Controller
{
    public function index()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chưa đăng nhập',
            ], 401);  // 401 Unauthorized
        }

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
        $request->validate([
            'bai_lam_id' => 'required|integer',
        ]);

        $baiLam = BaiLam::findOrFail($request->bai_lam_id);

        $tongCau = ChiTietDeThi::where('de_thi_id', $baiLam->de_thi_id)->count();
        $soCauDung = ChiTietBaiLam::where('bai_lam_id', $baiLam->bai_lam_id)
            ->where('dung_hay_sai', 1)
            ->count();

        $diem = round(($soCauDung / $tongCau) * 10, 2); // tính điểm theo thang 10

        $baiLam->update([
            'diem' => $diem,
            'thoi_gian_nop' => now(),
        ]);

        return response()->json([
            'message' => 'Nộp bài thành công',
            'diem' => $diem,
            'so_cau_dung' => $soCauDung,
            'tong_so_cau' => $tongCau,
        ]);
    }

}
