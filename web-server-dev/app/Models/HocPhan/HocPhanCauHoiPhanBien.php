<?php

namespace App\Models\HocPhan;

use App\Models\User\GiaoVien;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanCauHoiPhanBien extends Model
{
    use HasFactory;

    protected $table = "hp_cau_hoi_phan_bien";
    // public $timestamps = false;
    public $incrementing = false;
    protected $fillable = ["cau_hoi_id", "giao_vien_id", "ngay_han_phan_bien", "trang_thai_cau_hoi", "ly_do", "lan"];
    protected $hidden = ["created_at", "updated_at"];

    public function cauHoi()
    {
        return $this->belongsTo(HocPhanCauHoiForGiaoVien::class, "cau_hoi_id");
    }

    public function giaoVien()
    {
        return $this->belongsTo(GiaoVien::class, "giao_vien_id");
    }
}
