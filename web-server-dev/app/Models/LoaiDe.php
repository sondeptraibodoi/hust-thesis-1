<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoaiDe extends Model
{
    use HasFactory;
    protected $table = 'loai_this';

    public $timestamps = false;

    protected $fillable = ['ten_loai', 'thoi_gian_thi', 'diem_dat'];
}
