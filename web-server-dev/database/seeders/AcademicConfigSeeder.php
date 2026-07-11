<?php

namespace Database\Seeders;

use App\Models\CauHinhHeThong;
use App\Models\HocKy;
use Illuminate\Database\Seeder;

class AcademicConfigSeeder extends Seeder
{
    public function run()
    {
        CauHinhHeThong::updateOrCreate(
            ['key' => 'diem_qua_mon_mac_dinh'],
            [
                'value' => ['value' => 4.0],
                'group' => 'academic',
                'mo_ta' => 'Diem tong ket toi thieu de qua mon.',
            ]
        );

        CauHinhHeThong::updateOrCreate(
            ['key' => 'han_phuc_khao_mac_dinh_ngay'],
            [
                'value' => ['value' => 7],
                'group' => 'academic',
                'mo_ta' => 'So ngay sinh vien duoc gui phuc khao sau khi cong bo diem.',
            ]
        );

        HocKy::updateOrCreate(
            ['ma_hoc_ky' => '2025-2026-1'],
            [
                'ten_hoc_ky' => 'Hoc ky 1 nam hoc 2025-2026',
                'nam_hoc' => '2025-2026',
                'hoc_ky_so' => 1,
                'dang_mo_dang_ky' => false,
                'dang_mo_phuc_khao' => false,
                'diem_qua_mon_mac_dinh' => 4.0,
                'trang_thai' => 'du_kien',
            ]
        );
    }
}
