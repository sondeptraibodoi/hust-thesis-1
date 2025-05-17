<?php

namespace App\Models\Lop;

use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LopDiem extends Model
{
    protected $table = "ph_lop_sinh_vien_diems";
    protected $fillable = ["lop_id", "sinh_vien_id", "diem", "loai"];
    public function lop()
    {
        return $this->belongsTo(Lop::class, "lop_id");
    }
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, "sinh_vien_id");
    }
}
