<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeThi extends Model
{
    protected $table = 'de_thi';
    protected $primaryKey = 'de_thi_id';
    public $timestamps = false;

    protected $fillable = [
        'ten_de', 'do_kho_trung_binh', 'nguoi_tao', 'mo_ta', 'created_at'
    ];

    public function nguoiTao()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_tao');
    }

    public function chiTietDeThis()
    {
        return $this->hasMany(ChiTietDeThi::class, 'de_thi_id');
    }

    public function baiLams()
    {
        return $this->hasMany(BaiLam::class, 'de_thi_id');
    }
}
