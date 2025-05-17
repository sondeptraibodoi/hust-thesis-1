<?php

namespace Database\Seeders;

use App\Enums\LoaiBaiThi;
use App\Enums\TrangThaiCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanCauHoiLoai;
use App\Models\HocPhan\HocPhanChuong;
use Illuminate\Database\Seeder;

class HandleMakeCauHoiThiThuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $query = HocPhanChuong::query()->has("cauHois")->orderBy("ma_hoc_phan")->orderBy("stt");

        $chuongs = $query->get();
        foreach ($chuongs as $chuong) {
            $chuong_id = $chuong["id"];
            $so_cau_hoi_yeu_cau = $chuong["so_cau_hoi"];
            $query = HocPhanCauHoiChuong::where("chuong_id", $chuong_id);
            $count_cau_hoi = $query->count();
            if ($count_cau_hoi < 1) {
                continue;
            }
            $count_cau_hoi_thi_thu = $query
                ->clone()
                ->byLoaiThi(LoaiBaiThi::THU, $chuong_id)
                ->count();
            $diff = $so_cau_hoi_yeu_cau - $count_cau_hoi_thi_thu;
            if ($diff <= 0) {
                continue;
            }
            $queryCauHois = $query
                ->clone()
                ->orderByRaw("random()")
                ->whereHas("cauHoi", function ($query) {
                    $query->where("trang_thai", TrangThaiCauHoi::DangSuDung);
                })
                ->limit($diff);
            $cau_hois = $queryCauHois->get();
            foreach ($cau_hois as $key => $hocPhanCauHoiChuong) {
                HocPhanCauHoiLoai::updateOrCreate(
                    [
                        "cau_hoi_id" => $hocPhanCauHoiChuong["cau_hoi_id"],
                        "ma_hoc_phan" => $hocPhanCauHoiChuong->ma_hoc_phan,
                    ],
                    [
                        "loai" => LoaiBaiThi::THU,
                    ]
                );
            }
        }
    }
}
