<?php

namespace App\Models\TaiLieu;

use App\Models\Lop\Lop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TlTaiLieuLopMon extends Model
{
    use HasFactory;
    public $timestamps = false;
    public $incrementing = false;
    protected $table = "tl_tai_lieu_lop_mon";
    protected $fillable = ["tai_lieu_id", "lop_id"];

    public function taiLieu()
    {
        return $this->belongsTo(TlTaiLieu::class, "tai_lieu_id");
    }

    public function lop()
    {
        return $this->belongsTo(Lop::class, "lop_id");
    }
}
