<?php

namespace App\Models\TaiLieu;

use App\Models\Auth\User;
use App\Models\Lop\Lop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TlTaiLieu extends Model
{
    use HasFactory;
    protected $table = "tl_tai_lieus";
    protected $guard = ["id", "created_at", "updated_at"];
    protected $fillable = [
        "ma",
        "ten",
        "loai_tai_lieu_id",
        "pham_vi",
        "mo_ta",
        "link",
        "trang_thai",
        "created_by_id",
        "show_sinh_vien",
        "show_giao_vien",
    ];

    public function loaiTaiLieu()
    {
        return $this->belongsTo(TlLoaiTaiLieu::class, "loai_tai_lieu_id");
    }

    public function lops()
    {
        return $this->belongsToMany(Lop::class, "tl_tai_lieu_lop_mon", "tai_lieu_id", "lop_id");
    }

    public function taiLieuHocPhans()
    {
        return $this->belongsToMany(Lop::class, "tl_tai_lieu_hoc_phan", "tai_lieu_id", "ma_hoc_phan");
    }

    public function hocPhans()
    {
        return $this->hasMany(TlTaiLieuHocPhan::class, "tai_lieu_id");
    }
    public function createdBy()
    {
        return $this->belongsTo(User::class, "created_by_id");
    }
}
