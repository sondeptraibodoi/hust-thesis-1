<?php

namespace Database\Seeders;

use App\Enums\LoaiBaiThi;
use App\Helpers\DiemQTHelper;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Diem\DiemHocPhanChuong;
use DB;
use Exception;
use Illuminate\Database\Seeder;
use Storage;

class UpdateHocPhanBaiThiCauHoiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::beginTransaction();
        $res = [];

        try {
            // 1. Cập nhật is_correct = true
            HocPhanBaiThiCauHoi::query()
                ->where("cau_hoi_id", 3111)
                ->whereJsonContains("ket_qua", "uuid1")
                ->update(["is_correct" => true]);

            // 2. Lấy danh sách các bai_thi_id liên quan
            $baiThiIds = HocPhanBaiThiCauHoi::query()
                ->where("cau_hoi_id", 3111)
                ->whereJsonContains("ket_qua", "uuid1")
                ->pluck("bai_thi_id");
            // 3. Tính điểm cho từng bài thi
            $bai_this = HocPhanBaiThi::query()->with("chuong", "sinhVien")->whereIn("id", $baiThiIds)->get();
            foreach ($bai_this as $bai_thi) {
                $old_score = $bai_thi->diem;
                $this->calcScore($bai_thi);
                $res[] = [
                    "diem_cu" => $old_score,
                    "diem_moi" => $bai_thi->diem,
                    "bai_thi_id" => $bai_thi->id,
                    "sinh_vien_id" => $bai_thi->sinh_vien_id,
                    "sinh_vien_name" => $bai_thi->sinhVien->name,
                    "sinh_vien_mssv" => $bai_thi->sinhVien->mssv,
                    "chuong_id" => $bai_thi->chuong_id,
                    "chuong_name" => $bai_thi->chuong->ten,
                    "ma_hoc_phan" => $bai_thi->chuong->ma_hoc_phan,
                ];
            }

            // Thành công -> commit transaction
            DB::commit();
        } catch (Exception $e) {
            // Có lỗi -> rollback
            DB::rollBack();
            throw $e;
        }
        Storage::disk()->put("update-bai-thi-diem-sinh-vien.json", json_encode($res));
    }
    private function calcScore(HocPhanBaiThi $bai_thi)
    {
        $total_correct = HocPhanBaiThiCauHoi::query()
            ->where("bai_thi_id", $bai_thi->id)
            ->where("is_correct", true)
            ->count();
        $maxScore = $bai_thi->diem_toi_da;
        $total = $bai_thi->so_cau_hoi;
        $scorePerQuestion = $maxScore / $total;
        $score = $total_correct * $scorePerQuestion;
        $score = DiemQTHelper::ceil($score);
        $bai_thi->diem = $score;
        $bai_thi->save();
        $loaiThi = $bai_thi->loai;
        if ($loaiThi == LoaiBaiThi::THAT) {
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
        }
    }
}
