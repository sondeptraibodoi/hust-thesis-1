<?php

namespace Database\Seeders;

use App\Helpers\DiemQTHelper;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Diem\DiemHocPhanChuong;
use Illuminate\Database\Seeder;
use Storage;

class UpdateSinhVienCauHoiBiSaiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $cau_hois_this = HocPhanBaiThiCauHoi::query()->whereHas('baiThi', function ($query) {
            $query->where('loai', 'thi_that');
        })
            ->whereIn("cau_hoi_id", [962, 953])->get();
        $res = [];
        foreach ($cau_hois_this as $i => $cau_hois_thi) {
            try {
                $cau_hois_thi->is_correct = true;
                $cau_hois_thi->save();
                $bai_thi = HocPhanBaiThi::with('sinhVien')->findOrFail($cau_hois_thi->bai_thi_id);
                $total_correct = HocPhanBaiThiCauHoi::query()
                    ->where("bai_thi_id", $cau_hois_thi->bai_thi_id)
                    ->where("is_correct", true)
                    ->count();

                $maxScore = $bai_thi->diem_toi_da;
                $total = $bai_thi->so_cau_hoi;
                $scorePerQuestion = $maxScore / $total;
                $score = $total_correct * $scorePerQuestion;
                $score = DiemQTHelper::ceil($score);
                $old_score = $bai_thi->diem;
                $bai_thi->diem = $score;
                $bai_thi->save();

                DiemHocPhanChuong::updateOrCreate(
                    [
                        "lop_id" => $bai_thi->lop_id,
                        "sinh_vien_id" => $bai_thi->sinh_vien_id,
                        "chuong_id" => $bai_thi->chuong_id,
                    ],
                    [
                        "diem" => $score,
                    ]
                );
                $res[] = [
                    "cau_hoi_id" => $cau_hois_thi->cau_hoi_id,
                    "lop_id" => $bai_thi->lop_id,
                    "bai_thi_id" => $bai_thi->id,
                    "sinh_vien_mssv" => $bai_thi->sinhVien['mssv'],
                    "sinh_vien_ten" => $bai_thi->sinhVien['name'],
                    "sinh_vien_id" => $bai_thi->sinh_vien_id,
                    "chuong_id" => $bai_thi->chuong_id,
                    "diem_moi" => $score,
                    "diem_cu" => $old_score,
                ];
            } catch (\Throwable $th) {
                //throw $th;
                dd($i, $cau_hois_thi->toArray(),$bai_thi->toArray(),$th->getMessage());
            }
        }
        Storage::disk()->put("update-sinh-vien.json", json_encode($res));
    }
}
