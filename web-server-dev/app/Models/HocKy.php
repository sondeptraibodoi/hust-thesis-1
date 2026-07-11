<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocKy extends Model
{
    use HasFactory;

    protected $table = 'hoc_kies';

    protected $fillable = [
        'ma_hoc_ky',
        'ten_hoc_ky',
        'nam_hoc',
        'hoc_ky_so',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'dang_mo_dang_ky',
        'dang_mo_phuc_khao',
        'diem_qua_mon_mac_dinh',
        'trang_thai',
    ];

    protected $casts = [
        'dang_mo_dang_ky' => 'boolean',
        'dang_mo_phuc_khao' => 'boolean',
        'diem_qua_mon_mac_dinh' => 'decimal:2',
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc' => 'date',
    ];

    public function lopHocPhans()
    {
        return $this->hasMany(LopHocPhan::class, 'hoc_ky_id');
    }
}
