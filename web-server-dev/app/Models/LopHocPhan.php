<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LopHocPhan extends Model
{
    use HasFactory;

    protected $table = 'lop_hoc_phans';

    protected $fillable = [
        'hoc_ky_id',
        'mon_hoc_id',
        'giao_vien_bo_mon_id',
        'ma_lop_hoc_phan',
        'ten_lop_hoc_phan',
        'si_so_toi_da',
        'phong_hoc',
        'lich_hoc',
        'trang_thai',
    ];

    public function hocKy()
    {
        return $this->belongsTo(HocKy::class, 'hoc_ky_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function giaoVienBoMon()
    {
        return $this->belongsTo(GiaoVien::class, 'giao_vien_bo_mon_id');
    }

    public function dangKyMonHocs()
    {
        return $this->hasMany(DangKyMonHoc::class, 'lop_hoc_phan_id');
    }

    public function sinhViens()
    {
        return $this->belongsToMany(SinhVien::class, 'dang_ky_mon_hocs', 'lop_hoc_phan_id', 'sinh_vien_id')
            ->withPivot(['trang_thai', 'dang_ky_luc', 'huy_luc', 'ghi_chu'])
            ->withTimestamps();
    }

    public function bangDiems()
    {
        return $this->hasMany(BangDiem::class, 'lop_hoc_phan_id');
    }

    public function phucKhaos()
    {
        return $this->hasMany(PhucKhao::class, 'lop_hoc_phan_id');
    }
}
