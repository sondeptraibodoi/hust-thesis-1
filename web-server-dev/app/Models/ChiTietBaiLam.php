<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietBaiLam extends Model
{
    protected $table = 'chi_tiet_bai_lam';
    public $timestamps = false;

    protected $fillable = [
        'bai_lam_id', 'cau_hoi_id', 'dap_an_id', 'dung_hay_sai', 'created_at'
    ];

    public function baiLam()
    {
        return $this->belongsTo(BaiLam::class, 'bai_lam_id');
    }

    public function cauHoi()
    {
        return $this->belongsTo(CauHoi::class, 'cau_hoi_id');
    }

    public function dapAn()
    {
        return $this->belongsTo(DapAn::class, 'dap_an_id');
    }
}
