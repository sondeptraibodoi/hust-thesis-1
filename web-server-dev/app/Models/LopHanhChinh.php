<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LopHanhChinh extends Model
{
    use HasFactory;

    protected $table = 'lop_hanh_chinhs';

    protected $fillable = [
        'ma_lop',
        'ten_lop',
        'khoa',
        'nganh',
        'nien_khoa',
        'chuong_trinh_dao_tao_id',
        'giao_vien_chu_nhiem_id',
        'trang_thai',
    ];

    protected $casts = [
        'trang_thai' => 'boolean',
    ];

    public function giaoVienChuNhiem()
    {
        return $this->belongsTo(GiaoVien::class, 'giao_vien_chu_nhiem_id');
    }

    public function chuongTrinhDaoTao()
    {
        return $this->belongsTo(ChuongTrinhDaoTao::class, 'chuong_trinh_dao_tao_id');
    }

    public function sinhViens()
    {
        return $this->hasMany(SinhVien::class, 'lop_hanh_chinh_id');
    }
}
