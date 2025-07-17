<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaoVienLop extends Model
{
    use HasFactory;
    protected $table = 'giao_vien_lop';

    protected $fillable = ['giao_vien_id', 'lop_thi_id', 'vai_tro'];

    public function giaoVien()
    {
        return $this->belongsTo(GiaoVien::class);
    }

    public function lopThi()
    {
        return $this->belongsTo(LopThi::class);
    }
}
