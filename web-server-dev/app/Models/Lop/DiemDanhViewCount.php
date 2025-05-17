<?php

namespace App\Models\Lop;

use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiemDanhViewCount extends Model
{
    use HasFactory;

    protected $table = "diem_danh_view_count";
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }
    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
}
