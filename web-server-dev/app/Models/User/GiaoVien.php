<?php

namespace App\Models\User;

use App\Models\Auth\User;
use App\Models\DoAnBaoCao\DoAnLanBaoCao;
use App\Models\Lop\LopGiaoVien;
use App\Models\Lop\LanDiemDanh;
use App\Models\Lop\LopSinhVienDoAn;
use App\Models\Lop\LopThi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class GiaoVien extends Model
{
    protected $table = "u_giao_viens";
    protected $fillable = ["name", "email"];

    public function user(): MorphOne
    {
        return $this->morphOne(User::class, "info");
    }
    public function lopGiaoVien()
    {
        return $this->hasMany(LopGiaoVien::class);
    }
    public function lopTrongThi()
    {
        return $this->belongsToMany(LopThi::class, "ph_lop_thi_giao_viens", "giao_vien_id", "lop_thi_id");
    }
    public function lopSinhVienDoAn()
    {
        return $this->hasMany(LopSinhVienDoAn::class);
    }
    public function getCauserDisplay()
    {
        return $this->name;
    }
}
