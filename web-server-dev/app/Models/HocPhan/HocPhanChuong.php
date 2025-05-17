<?php

namespace App\Models\HocPhan;

use App\Models\Diem\DiemHocPhanChuong;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\Lop\MaHocPhan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanChuong extends Model
{
    use HasFactory;

    protected $table = "hp_chuongs";

    protected $fillable = [
        "ma_hoc_phan",
        "ten",
        "mo_ta",
        "trang_thai",
        "tuan_dong",
        "tuan_mo",
        "thoi_gian_thi",
        "thoi_gian_doc",
        "so_cau_hoi",
        "diem_toi_da",
        "stt",
    ];

    public function taiLieus()
    {
        return $this->hasMany(HocPhanChuongTaiLieu::class, "chuong_id");
    }

    public function diemHocPhanChuong()
    {
        return $this->hasMany(DiemHocPhanChuong::class, "chuong_id");
    }

    public function maHp()
    {
        return $this->belongsTo(MaHocPhan::class, "ma_hoc_phan", "ma");
    }

    public function baiThi()
    {
        return $this->hasMany(HocPhanBaiThi::class, "chuong_id");
    }

    public function scopeActive($query): void
    {
        $query->where("trang_thai", "1-Đang sử dụng");
    }

    public function cauHois()
    {
        return $this->belongsTo(HocPhanCauHoiChuong::class, "id", "chuong_id");
    }
}
