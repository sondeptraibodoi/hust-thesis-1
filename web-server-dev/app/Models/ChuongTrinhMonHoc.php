<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChuongTrinhMonHoc extends Model
{
    use HasFactory;

    protected $table = 'chuong_trinh_mon_hoc';

    protected $fillable = [
        'chuong_trinh_dao_tao_id',
        'mon_hoc_id',
        'hoc_ky_goi_y',
        'bat_buoc',
    ];

    protected $casts = [
        'bat_buoc' => 'boolean',
    ];

    public function chuongTrinhDaoTao()
    {
        return $this->belongsTo(ChuongTrinhDaoTao::class, 'chuong_trinh_dao_tao_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }
}
