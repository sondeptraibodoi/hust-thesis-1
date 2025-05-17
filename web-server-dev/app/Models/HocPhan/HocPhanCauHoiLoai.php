<?php

namespace App\Models\HocPhan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanCauHoiLoai extends Model
{
    use \Awobaz\Compoships\Compoships;
    use HasFactory;

    protected $table = "hp_cau_hoi_loai";
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = "cau_hoi_id";
    protected $fillable = ["cau_hoi_id", "ma_hoc_phan", "loai"];

    public function cauHoi()
    {
        return $this->belongsTo(HocPhanCauHoi::class, "cau_hoi_id", "id");
    }
}
