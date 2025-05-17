<?php

namespace App\Models\Lop;

use App\Models\User\SinhVien;
use App\Models\Lop\Lop;
use App\Models\KiHoc;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class DonDangKyThiBu extends Model implements HasMedia
{
    // class DonDangKyThiBu extends Model
    use HasFactory;
    use InteractsWithMedia;
    protected $table = "sv_don_dang_ky_thi_bus";
    protected $fillable = ["sinh_vien_id", "lop_id", "ki_hoc", "dot_thi", "ly_do", "phan_hoi", "trang_thai"];

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }

    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
}
