<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SinhVien extends Model
{
    use HasFactory;
    protected $table = 'sinh_viens';

    protected $fillable = [
        'nguoi_dung_id',
        'lop_hanh_chinh_id',
        'chuong_trinh_dao_tao_id',
        'mssv',
        'ho_ten',
        'email',
        'ngay_sinh',
        'trang_thai_hoc_tap',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(Auth\User::class, 'nguoi_dung_id');
    }

    public function lopHanhChinh()
    {
        return $this->belongsTo(LopHanhChinh::class, 'lop_hanh_chinh_id');
    }

    public function chuongTrinhDaoTao()
    {
        return $this->belongsTo(ChuongTrinhDaoTao::class, 'chuong_trinh_dao_tao_id');
    }

    public function dangKyMonHocs()
    {
        return $this->hasMany(DangKyMonHoc::class, 'sinh_vien_id');
    }

    public function bangDiems()
    {
        return $this->hasMany(BangDiem::class, 'sinh_vien_id');
    }

    public function phucKhaos()
    {
        return $this->hasMany(PhucKhao::class, 'sinh_vien_id');
    }

    public function lopHocPhans()
    {
        return $this->belongsToMany(LopHocPhan::class, 'dang_ky_mon_hocs', 'sinh_vien_id', 'lop_hoc_phan_id')
            ->withPivot(['trang_thai', 'dang_ky_luc', 'huy_luc', 'ghi_chu'])
            ->withTimestamps();
    }
}
