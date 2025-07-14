<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaoVien extends Model
{
    use HasFactory;
    protected $table = 'giao_viens';

    protected $fillable = ['nguoi_dung_id', 'email','ho_ten', 'ngay_sinh'];
}
