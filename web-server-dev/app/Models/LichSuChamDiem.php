<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LichSuChamDiem extends Model
{
    use HasFactory;

    protected $table = 'lich_su_cham_diems';

    protected $fillable = [
        'bang_diem_id',
        'nguoi_cham_id',
        'loai_cham',
        'diem_truoc',
        'diem_sau',
        'ly_do',
    ];

    protected $casts = [
        'diem_truoc' => 'array',
        'diem_sau' => 'array',
    ];

    public function bangDiem()
    {
        return $this->belongsTo(BangDiem::class, 'bang_diem_id');
    }

    public function nguoiCham()
    {
        return $this->belongsTo(GiaoVien::class, 'nguoi_cham_id');
    }
}
