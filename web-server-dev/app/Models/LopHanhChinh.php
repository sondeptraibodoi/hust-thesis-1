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
        'giao_vien_chu_nhiem_id',
    ];

    public function giaoVienChuNhiem()
    {
        return $this->belongsTo(GiaoVien::class, 'giao_vien_chu_nhiem_id');
    }

    public function sinhViens()
    {
        return $this->hasMany(SinhVien::class, 'lop_hanh_chinh_id');
    }
}
