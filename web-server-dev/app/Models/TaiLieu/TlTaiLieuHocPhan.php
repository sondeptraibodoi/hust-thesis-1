<?php

namespace App\Models\TaiLieu;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TlTaiLieuHocPhan extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $table = "tl_tai_lieu_hoc_phan";

    protected $fillable = ["tai_lieu_id", "ma_hoc_phan"];

    public function taiLieu()
    {
        return $this->belongsTo(TlTaiLieu::class, "tai_lieu_id");
    }
    public $timestamps = false;
}
