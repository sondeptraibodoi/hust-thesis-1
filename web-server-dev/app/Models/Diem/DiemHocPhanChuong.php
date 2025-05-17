<?php

namespace App\Models\Diem;

use App\Models\Lop\Lop;
use App\Models\HocPhan\HocPhanChuong;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Model;

class DiemHocPhanChuong extends Model
{
    protected $fillable = ["lop_id", "sinh_vien_id", "diem", "chuong_id", "thoi_gian_cong_khai"];
    protected $table = "hp_sinh_vien_chuong_diem";
    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
    public function chuong()
    {
        return $this->belongsTo(HocPhanChuong::class);
    }
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }
}
