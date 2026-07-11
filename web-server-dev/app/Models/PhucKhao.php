<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhucKhao extends Model
{
    use HasFactory;

    protected $table = 'phuc_khaos';

    protected $fillable = [
        'bang_diem_id',
        'sinh_vien_id',
        'lop_hoc_phan_id',
        'trang_thai',
        'noi_dung',
        'diem_cu',
        'diem_moi',
        'giao_vien_xu_ly_id',
        'ngay_gui',
        'ngay_xu_ly',
        'ket_qua_xu_ly',
    ];

    protected $casts = [
        'diem_cu' => 'decimal:2',
        'diem_moi' => 'decimal:2',
        'ngay_gui' => 'datetime',
        'ngay_xu_ly' => 'datetime',
    ];

    public function bangDiem()
    {
        return $this->belongsTo(BangDiem::class, 'bang_diem_id');
    }

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, 'sinh_vien_id');
    }

    public function lopHocPhan()
    {
        return $this->belongsTo(LopHocPhan::class, 'lop_hoc_phan_id');
    }

    public function giaoVienXuLy()
    {
        return $this->belongsTo(GiaoVien::class, 'giao_vien_xu_ly_id');
    }
}
