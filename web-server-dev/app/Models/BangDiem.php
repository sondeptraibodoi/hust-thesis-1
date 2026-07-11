<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BangDiem extends Model
{
    use HasFactory;

    protected $table = 'bang_diems';

    protected $fillable = [
        'dang_ky_mon_hoc_id',
        'sinh_vien_id',
        'lop_hoc_phan_id',
        'diem_chuyen_can',
        'diem_giua_ky',
        'diem_cuoi_ky',
        'diem_tong_ket',
        'diem_chu',
        'ket_qua',
        'trang_thai',
        'nguoi_cham_id',
        'nguoi_chot_id',
        'ngay_cham',
        'ngay_chot',
        'ghi_chu',
    ];

    protected $casts = [
        'diem_chuyen_can' => 'decimal:2',
        'diem_giua_ky' => 'decimal:2',
        'diem_cuoi_ky' => 'decimal:2',
        'diem_tong_ket' => 'decimal:2',
        'ngay_cham' => 'datetime',
        'ngay_chot' => 'datetime',
    ];

    public function dangKyMonHoc()
    {
        return $this->belongsTo(DangKyMonHoc::class, 'dang_ky_mon_hoc_id');
    }

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, 'sinh_vien_id');
    }

    public function lopHocPhan()
    {
        return $this->belongsTo(LopHocPhan::class, 'lop_hoc_phan_id');
    }

    public function nguoiCham()
    {
        return $this->belongsTo(GiaoVien::class, 'nguoi_cham_id');
    }

    public function nguoiChot()
    {
        return $this->belongsTo(Auth\User::class, 'nguoi_chot_id');
    }

    public function lichSuChamDiems()
    {
        return $this->hasMany(LichSuChamDiem::class, 'bang_diem_id');
    }

    public function phucKhaos()
    {
        return $this->hasMany(PhucKhao::class, 'bang_diem_id');
    }
}
