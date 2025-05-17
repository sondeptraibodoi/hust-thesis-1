<?php

namespace App\Models\TaiLieu;

use App\Models\TaiLieu\TlTaiLieu;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TlLoaiTaiLieu extends Model
{
    use HasFactory;
    protected $table = "tl_loai_tai_lieus";
    protected $fillable = ["ma", "loai", "nhom"];

    public function taiLieus()
    {
        return $this->hasMany(TlTaiLieu::class, "loai_tai_lieu_id");
    }
}
