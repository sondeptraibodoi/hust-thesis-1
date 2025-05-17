<?php

namespace App\Models\DoAnBaoCao;

use App\Models\Lop\Lop;
use App\Models\User\SinhVien;
use Illuminate\Database\Eloquent\Model;

class DoAnBaoCao extends Model
{
    // public $timestamps = false;
    // public $incrementing = false;
    protected $table = "ph_do_an_bao_caos";
    protected $fillable = [
        "lan",
        "ki_hoc",
        "ngay_bao_cao",
        "sinh_vien_id",
        "giao_vien_id",
        "noi_dung_thuc_hien",
        "noi_dung_da_thuc_hien",
        "diem_y_thuc",
        "diem_noi_dung",
        "lop_id",
        "ghi_chu",
    ];

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class);
    }

    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
}
