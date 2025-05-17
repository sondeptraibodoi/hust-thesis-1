<?php

namespace App\Models\Lop;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;

class ThucTap extends Model
{
    use HasFactory;
    protected $table = "ph_thuc_tap";
    protected $fillable = ["ten_cong_ty", "dia_chi", "ghi_chu"];
    public function lop()
    {
        return $this->belongsTo(Lop::class);
    }
    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, "sinh_vien_id");
    }
}
