<?php

namespace App\Models\BaiThi;

use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Lop\Lop;
use App\Models\HocPhan\HocPhanChuong;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanBaiThi extends Model
{
    use HasFactory;

    protected $table = "hp_bai_this";

    protected $fillable = [
        "lop_id",
        "chuong_id",
        "sinh_vien_id",
        "bat_dau_thi_at",
        "ket_thuc_thi_at",
        "thoi_gian_thi_cho_phep",
        "loai",
        "code",
        "diem",
        "so_cau_hoi",
        "diem_toi_da",
        "user_id",
    ];

    protected $casts = [
        "ket_thuc_thi_at" => "datetime",
        "bat_dau_thi_at" => "datetime",
        "created_at" => "datetime",
        "updated_at" => "datetime",
    ];
    public function lop()
    {
        return $this->belongsTo(Lop::class, "lop_id");
    }

    public function chuong()
    {
        return $this->belongsTo(HocPhanChuong::class, "chuong_id");
    }

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, "sinh_vien_id");
    }

    public function baiThiCauHoi()
    {
        return $this->hasMany(HocPhanBaiThiCauHoi::class, "bai_thi_id");
    }
}
