<?php

namespace App\Models\NhiemVu;

use App\Models\Auth\User;
use App\Models\User\GiaoVien;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhiemVu extends Model
{
    use HasFactory;
    const INCLUDE = ["nguoiTao", "nguoiLam"];

    protected $table = "nv_nhiem_vus";
    protected $fillable = [
        "tieu_de",
        "nguoi_tao_id",
        "nguoi_lam_id",
        "trang_thai",
        "loai",
        "noi_dung",
        "ngay_het_hieu_luc",
        "ngay_thuc_hien",
    ];
    protected $casts = [
        "noi_dung" => "array",
        "ngay_thuc_hien" => "date",
        "ngay_het_hieu_luc" => "date",
    ];
    public function nguoiTao()
    {
        return $this->belongsTo(User::class, "nguoi_tao_id");
    }
    public function nguoiLam()
    {
        return $this->belongsTo(User::class, "nguoi_lam_id");
    }
}
