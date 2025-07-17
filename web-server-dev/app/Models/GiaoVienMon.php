<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaoVienMon extends Model
{
    use HasFactory;
    protected $table = 'giao_vien_mon';

    protected $fillable = ['giao_vien_id', 'mon_hoc_id'];

    public function giaoVien()
    {
        return $this->belongsTo(GiaoVien::class);
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class);
    }
}
