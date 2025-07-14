<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SinhVien extends Model
{
    use HasFactory;
    protected $table = 'sinh_viens';

    protected $fillable = ['nguoi_dung_id', 'mssv','ho_ten', 'email', 'ngay_sinh'];
}
