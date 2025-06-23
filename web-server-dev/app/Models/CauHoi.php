<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CauHoi extends Model
{
    protected $table = 'cau_hoi';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'de_bai', 'do_kho', 'mon_hoc_id', 'dap_an'
    ];

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function dapAns()
    {
        return $this->hasMany(DapAn::class, 'id');
    }

    public function chiTietDeThis()
    {
        return $this->hasMany(ChiTietDeThi::class, 'id');
    }

    public function chiTietBaiLams()
    {
        return $this->hasMany(ChiTietBaiLam::class, 'id');
    }
}
