<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChuongTrinhDaoTao extends Model
{
    use HasFactory;

    protected $table = 'chuong_trinh_dao_taos';

    protected $fillable = [
        'ma_chuong_trinh',
        'ten_chuong_trinh',
        'nganh',
        'khoa',
        'nien_khoa',
        'tong_tin_chi',
        'trang_thai',
    ];

    protected $casts = [
        'trang_thai' => 'boolean',
    ];

    public function monHocs()
    {
        return $this->belongsToMany(MonHoc::class, 'chuong_trinh_mon_hoc', 'chuong_trinh_dao_tao_id', 'mon_hoc_id')
            ->withPivot(['hoc_ky_goi_y', 'bat_buoc'])
            ->withTimestamps();
    }

    public function lopHanhChinhs()
    {
        return $this->hasMany(LopHanhChinh::class, 'chuong_trinh_dao_tao_id');
    }

    public function sinhViens()
    {
        return $this->hasMany(SinhVien::class, 'chuong_trinh_dao_tao_id');
    }
}
