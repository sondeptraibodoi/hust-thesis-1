<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DapAn extends Model
{
    protected $table = 'dap_an';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'cau_hoi_id', 'noi_dung', 'la_dap_an_dung', 'thu_tu'
    ];

    public function cauHoi()
    {
        return $this->belongsTo(CauHoi::class, 'cau_hoi_id');
    }

    public function chiTietBaiLams()
    {
        return $this->hasMany(ChiTietBaiLam::class, 'id');
    }
}
