<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NguoiDung extends Model
{
    protected $table = 'nguoi_dung';
    protected $primaryKey = 'nguoi_dung_id';

    protected $fillable = [
        'ma_nguoi_dung', 'ho_ten', 'email', 'username', 'mat_khau', 'lop', 'vai_tro',
    ];

    protected $hidden = ['mat_khau'];

    // Scope lọc sinh viên
    public function scopeSinhVien($query)
    {
        return $query->where('vai_tro', 'sinh_vien');
    }
}
