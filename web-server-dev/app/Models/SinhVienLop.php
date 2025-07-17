<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SinhVienLop extends Model
{
    use HasFactory;
    protected $table = 'sinh_vien_lop';

    protected $fillable = ['lop_thi_id', 'sinh_vien_id'];

    public function lopThi()
    {
        return $this->belongsTo(LopThi::class);
    }

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }
}
