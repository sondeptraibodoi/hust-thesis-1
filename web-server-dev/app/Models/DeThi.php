<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeThi extends Model
{
    protected $table = 'de_this';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'code', 'mon_hoc_id', 'da_lam', 'tong_so_cau_hoi', 'thoi_gian_thi', 'nguoi_tao_id', 'do_kho', 'diem_dat', 'ghi_chu', 'loai_thi_id'
    ];

    public function nguoiTao()
    {
        return $this->belongsTo(User::class, 'nguoi_tao_id');
    }

    public function chiTietDeThis()
    {
        return $this->hasMany(ChiTietDeThi::class, 'de_thi_id');
    }

    public function baiLams()
    {
        return $this->hasMany(BaiLam::class, 'de_thi_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function loaiThi() {
        return $this->belongsTo(LoaiDe::class, 'loai_thi_id');
    }

}
