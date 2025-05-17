<?php

namespace App\Models\HocPhan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanChuongTaiLieu extends Model
{
    use HasFactory;

    public $timestamps = true;

    protected $table = "hp_chuong_tai_lieus";

    protected $fillable = ["chuong_id", "ten", "duong_dan", "so_trang", "duong_dan_xem"];
    protected $hidden = ["created_at", "updated_at"];

    public function chuong()
    {
        return $this->belongsTo(HocPhanChuong::class, "chuong_id");
    }
}
