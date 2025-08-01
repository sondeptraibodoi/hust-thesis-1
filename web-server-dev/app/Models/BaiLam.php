<?php

namespace App\Models;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BaiLam extends Model
{
    protected $table = 'bai_kiem_tra';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'nguoi_dung_id', 'de_thi_id', 'thoi_gian_nop', 'diem', 'mon_hoc_id', 'thoi_gian_lam_bai', 'created_at', 'updated_at', 'lop_thi_id'
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function deThi()
    {
        return $this->belongsTo(DeThi::class, 'de_thi_id');
    }

    public function chiTietBaiLams()
    {
        return $this->hasMany(ChiTietBaiLam::class, 'bai_kiem_tra_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function lopThi()
    {
        return $this->belongsTo(LopThi::class);
    }
}
