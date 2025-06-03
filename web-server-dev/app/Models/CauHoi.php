<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CauHoi extends Model
{
    protected $table = 'cau_hoi';
    protected $primaryKey = 'cau_hoi_id';
    public $timestamps = false;

    protected $fillable = [
        'noi_dung', 'do_kho', 'mon_hoc_id', 'created_at'
    ];

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function dapAns()
    {
        return $this->hasMany(DapAn::class, 'cau_hoi_id');
    }

    public function chiTietDeThis()
    {
        return $this->hasMany(ChiTietDeThi::class, 'cau_hoi_id');
    }

    public function chiTietBaiLams()
    {
        return $this->hasMany(ChiTietBaiLam::class, 'cau_hoi_id');
    }
}
