<?php
namespace Database\Seeders;

use App\Constants\RoleCode;
use App\Models\Auth\User;
use App\Models\CauHoi;
use App\Models\ChiTietDeThi;
use App\Models\DeThi;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DeThiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $monHocIds = [1, 2, 3, 4, 5]; // Toán, Văn, Anh, Lý, Hóa
        $nguoiTaoId = 1;

        foreach ($monHocIds as $monHocId) {
            for ($diemToiDa = 1; $diemToiDa <= 10; $diemToiDa++) {
                for ($i = 0; $i < 5; $i++) {
                    $cauHoiList = CauHoi::where('mon_hoc_id', $monHocId)
                        ->where('do_kho', $diemToiDa)
                        ->inRandomOrder()
                        ->limit(5)
                        ->get();

                    if ($cauHoiList->count() < 5) {
                        echo "⚠️ Không đủ câu hỏi cho môn {$monHocId} - độ khó {$diemToiDa}, bỏ qua đề.\n";
                        continue;
                    }
                    do {
                        $code = now()->format('Ymd') . str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
                    } while (DeThi::where('code', $code)->exists());


                    $deThi = DeThi::create([
                        'mon_hoc_id' => $monHocId,
                        'da_lam' => false,
                        'tong_so_cau_hoi' => 5,
                        'thoi_gian_thi' => 30,
                        'nguoi_tao_id' => $nguoiTaoId,
                        'diem_toi_da' => $diemToiDa,
                        'diem_dat' => 8,
                        'ghi_chu' => null,
                        'code' => $code,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $diemMoiCau = 2;

                    foreach ($cauHoiList as $cauHoi) {
                        ChiTietDeThi::create([
                            'de_thi_id' => $deThi->id,
                            'cau_hoi_id' => $cauHoi->id,
                            'diem' => $diemMoiCau,
                            'ghi_chu' => null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }
}
