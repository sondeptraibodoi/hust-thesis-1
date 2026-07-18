<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DangKyMonHoc extends Model
{
    use HasFactory;

    protected $table = 'dang_ky_mon_hocs';

    protected $fillable = [
        'sinh_vien_id',
        'hoc_ky_id',
        'mon_hoc_id',
        'lop_hoc_phan_id',
        'trang_thai',
        'dang_ky_luc',
        'huy_luc',
        'ghi_chu',
    ];

    protected $casts = [
        'dang_ky_luc' => 'datetime',
        'huy_luc' => 'datetime',
    ];

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, 'sinh_vien_id');
    }

    public function lopHocPhan()
    {
        return $this->belongsTo(LopHocPhan::class, 'lop_hoc_phan_id');
    }

    public function hocKy()
    {
        return $this->belongsTo(HocKy::class, 'hoc_ky_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function bangDiem()
    {
        return $this->hasOne(BangDiem::class, 'dang_ky_mon_hoc_id');
    }
}
