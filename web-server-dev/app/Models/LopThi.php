<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LopThi extends Model
{
    use HasFactory;
    protected $table = 'lop_this';

    protected $fillable = ['ten_lop', 'hoc_ky', 'nam_hoc', 'mon_hoc_id'];

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class);
    }

    public function sinhViens()
    {
        return $this->belongsToMany(SinhVien::class, 'sinh_vien_lop', 'lop_thi_id', 'sinh_vien_id')->withTimestamps();
    }

    public function giaoViens()
    {
        return $this->belongsToMany(GiaoVien::class, 'giao_vien_lop', 'lop_thi_id', 'giao_vien_id')->withPivot('vai_tro')->withTimestamps();
    }

    public function deThiLops()
    {
        return $this->hasMany(DeThiLop::class, 'lop_thi_id');
    }
}
