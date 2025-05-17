<?php

namespace App\Models\Lop;

use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Model;

class LopSinhVien extends Model
{
    public $timestamps = false;
    public $incrementing = false;
    protected $table = "ph_lop_sinh_viens";
    protected $fillable = ["lop_id", "sinh_vien_id", "stt", "diem_y_thuc", "nhom", "diem", "lop_goc_id"];
    public function lop()
    {
        return $this->belongsTo(Lop::class, "ph_lops");
    }
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, "u_sinh_viens");
    }
}
