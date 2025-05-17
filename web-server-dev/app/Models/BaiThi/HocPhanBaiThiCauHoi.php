<?php

namespace App\Models\BaiThi;

use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\HocPhan\HocPhanCauHoi;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanBaiThiCauHoi extends Model
{
    use HasFactory;

    protected $table = "hp_bai_thi_cau_hois";

    protected $fillable = ["bai_thi_id", "cau_hoi_id", "order", "do_kho", "noi_dung", "lua_chon", "dap_an", "ket_qua"];
    protected $cats = [
        "is_correct" => "boolean",
    ];
    public function baiThi()
    {
        return $this->belongsTo(HocPhanBaiThi::class, "bai_thi_id");
    }

    public function cauHoi()
    {
        return $this->belongsTo(HocPhanCauHoi::class, "cau_hoi_id");
    }
}
