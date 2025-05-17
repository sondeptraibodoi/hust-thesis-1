<?php

namespace App\Models\Lop;

use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LopGiaoVienPhanBien extends Model
{
    use HasFactory;
    protected $table = "ph_lop_sinh_vien_giao_vien_phan_bien";
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = ["lop_id", "giao_vien_id", "sinh_vien_id"];
    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
    public function giaoVien()
    {
        return $this->belongsTo(GiaoVien::class);
    }
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }
}
