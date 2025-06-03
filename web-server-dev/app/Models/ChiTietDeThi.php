<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChiTietDeThi extends Model
{
    protected $table = 'chi_tiet_de_thi';
    public $timestamps = false;

    protected $fillable = [
        'de_thi_id', 'cau_hoi_id', 'thu_tu', 'created_at'
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
