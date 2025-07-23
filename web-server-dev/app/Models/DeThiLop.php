<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeThiLop extends Model
{
    use HasFactory;
    protected $table = 'de_thi_lop';

    protected $fillable = ['lop_thi_id', 'de_thi_id', 'loai_thi_id', 'level'];

    public function lopThi()
    {
        return $this->belongsTo(LopThi::class);
    }

    public function deThi()
    {
        return $this->belongsTo(DeThi::class);
    }

    public function loaiThi()
    {
        return $this->belongsTo(LoaiDe::class);
    }
}
