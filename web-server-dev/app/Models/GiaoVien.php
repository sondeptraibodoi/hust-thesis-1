<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaoVien extends Model
{
    use HasFactory;
    protected $table = 'giao_viens';

    protected $fillable = [
        'nguoi_dung_id',
        'ma_giao_vien',
        'email',
        'ho_ten',
        'ngay_sinh',
        'bo_mon',
        'hoc_vi',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(Auth\User::class, 'nguoi_dung_id');
    }

    public function lopHocPhans()
    {
        return $this->hasMany(LopHocPhan::class, 'giao_vien_bo_mon_id');
    }

    public function lopChuNhiems()
    {
        return $this->hasMany(LopHanhChinh::class, 'giao_vien_chu_nhiem_id');
    }

    public function bangDiemsDaCham()
    {
        return $this->hasMany(BangDiem::class, 'nguoi_cham_id');
    }

    public function phucKhaosXuLy()
    {
        return $this->hasMany(PhucKhao::class, 'giao_vien_xu_ly_id');
    }
}
