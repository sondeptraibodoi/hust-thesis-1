<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietBaiLam extends Model
{
    protected $table = 'cau_hoi_bai_kiem_tra';
    public $timestamps = false;

    protected $fillable = [
        'bai_kiem_tra_id', 'cau_hoi_id', 'da_tra_loi', 'cau_tra_loi', 'dap_an_dung', 'diem'
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
