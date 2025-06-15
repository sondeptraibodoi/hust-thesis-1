<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CauHoi;
use App\Models\DeThi;
use App\Models\ChiTietDeThi;

class DeThiController extends Controller
{
    public function soan_de_tu_dong(Request $request)
    {
        $request->validate([
            'ten_de' => 'required|string|max:255',
            'so_cau' => 'required|integer|min:1',
            'do_kho_ban_dau' => 'required|integer|min:1|max:10',
        ]);

        $soCau = $request->so_cau;
        $mucKho = $request->do_kho_ban_dau;
        $dsCauHoi = [];

        for ($i = 0; $i < $soCau; $i++) {
            // Lấy random 1 câu hỏi theo mức độ 
            $cauHoi = CauHoi::where('do_kho', $mucKho)
                            ->inRandomOrder()
                            ->first();

            if ($cauHoi) {
                $dsCauHoi[] = $cauHoi;

                // Thay đổi mức độ sau khoảng 3 đến 5 câu
                if (($i + 1) % rand(3, 5) == 0) {
                    $delta = rand(0, 1) ? 1 : -1;
                    $mucKho = max(1, min(10, $mucKho + $delta));
                }
            }
        }

        // Lưu đề thi mới
        DB::beginTransaction();
        try {
            $deThiId = DB::table('de_thi')->insertGetId([
                'ten_de' => $request->ten_de,
                'nguoi_tao_id' => auth()->id(),
                'created_at' => now()
            ]);

            foreach ($dsCauHoi as $index => $cauHoi) {
                DB::table('chi_tiet_de_thi')->insert([
                    'de_thi_id' => $deThiId,
                    'cau_hoi_id' => $cauHoi->cau_hoi_id,
                    'thu_tu' => $index + 1
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Tạo đề thành công', 'de_thi_id' => $deThiId], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Lỗi khi tạo đề: ' . $e->getMessage()], 500);
        }
    }
}
