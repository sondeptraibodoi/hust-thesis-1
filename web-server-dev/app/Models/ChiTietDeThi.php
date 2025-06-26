<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChiTietDeThi extends Model
{
    protected $table = 'de_thi_bai_kiem_tra';
    public $timestamps = false;

    protected $fillable = [
        'de_thi_id', 'cau_hoi_id', 'diem', 'ghi_chu'
    ];

    public function deThi()
    {
        return $this->belongsTo(DeThi::class, 'de_thi_id');
    }

    public function cauHoi()
    {
        return $this->belongsTo(CauHoi::class, 'cau_hoi_id');
    }
}
