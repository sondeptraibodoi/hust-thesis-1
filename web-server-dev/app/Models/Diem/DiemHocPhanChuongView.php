<?php

namespace App\Models\Diem;

use App\Models\Lop\Lop;
use App\Models\HocPhan\HocPhanChuong;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Model;

class DiemHocPhanChuongView extends Model
{
    protected $table = "hp_sinh_vien_chuong_diem_view";
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
