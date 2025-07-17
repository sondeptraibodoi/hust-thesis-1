<?php

namespace Database\Seeders;

use App\Constants\RoleCode;
use App\Models\Auth\User;
use App\Models\CauHoi;
use App\Models\ChiTietDeThi;
use App\Models\DeThi;
use App\Models\LoaiDe;
use Arr;
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

        $loais = [
            [
                "ten_loai" => "Đánh giá năng lực",
            ],
            [
                "ten_loai" => "Kiểm tra môn",
            ],
        ];

        foreach ($loais as $key => $value) {
            # code...
            LoaiDe::create($value);
        }

        foreach ($monHocIds as $monHocId) {
        $doKhoList = array_merge(
            Arr::random([1, 2, 3], 3),          // 30% dễ
            Arr::random([4, 5, 6, 7, 8], 5),    // 50% trung bình
            Arr::random([9, 10], 2)             // 20% khó
        );

        $cauHoiList = collect();

        foreach ($doKhoList as $doKho) {
            $cauHoi = CauHoi::where('mon_hoc_id', $monHocId)
                ->where('do_kho', $doKho)
                ->inRandomOrder()
                ->first();

            if (!$cauHoi) {
                echo "⚠️ Không đủ câu hỏi môn {$monHocId}, độ khó {$doKho}, bỏ qua môn này.\n";
                continue 2; // Chuyển sang môn tiếp theo
            }

            $cauHoiList->push($cauHoi);
        }

        do {
            $code = now()->format('Ymd') . str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        } while (DeThi::where('code', $code)->exists());

        $deThi = DeThi::create([
            'mon_hoc_id' => $monHocId,
            'tong_so_cau_hoi' => 10,
            'thoi_gian_thi' => 60,
            'nguoi_tao_id' => $nguoiTaoId,
            'diem_dat' => 0,
            'ghi_chu' => 'Đề thi đánh giá năng lực',
            'code' => $code,
            'created_at' => now(),
            'updated_at' => now(),
            'loai_thi_id' => 1
        ]);

        $diemMoiCau = 1; // Mỗi câu 1 điểm (10 câu 10 điểm)

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
