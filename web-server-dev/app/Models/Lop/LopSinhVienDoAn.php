<?php

namespace App\Models\Lop;

use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Model;

class LopSinhVienDoAn extends Model
{
    public $timestamps = false;
    public $incrementing = false;
    protected $table = "ph_lop_sinh_vien_do_ans";
    protected $fillable = ["lop_id", "sinh_vien_id", "giao_vien_id", "ten_de_tai", "noi_dung", "cac_moc_quan_trong"];
    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }
    public function giaoVien()
    {
        return $this->belongsTo(GiaoVien::class);
    }
}
