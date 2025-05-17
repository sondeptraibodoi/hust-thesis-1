<?php

namespace App\Models\Lop;

use App\Models\HocPhan\HocPhanChuong;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaHocPhan extends Model
{
    use HasFactory;
    protected $table = "ph_ma_hoc_phans";
    protected $fillable = ["ma", "ten_hp", "is_do_an", "is_do_an_tot_nghiep", "is_thuc_tap"];

    public function lops()
    {
        return $this->hasMany(Lop::class, "ma_hp", "ma");
    }

    public function hpChuong()
    {
        return $this->hasMany(HocPhanChuong::class, "ma_hoc_phan", "ma");
    }
    public function scopeIsDoAn($query)
    {
        $query->where(function ($query) {
            $query->where("is_do_an", true);
            $query->orWhere("is_do_an_tot_nghiep", true);
        });
    }
}
