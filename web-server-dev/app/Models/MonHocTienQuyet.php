<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonHocTienQuyet extends Model
{
    use HasFactory;

    protected $table = 'mon_hoc_tien_quyet';

    protected $fillable = [
        'mon_hoc_id',
        'mon_hoc_tien_quyet_id',
        'loai_dieu_kien',
    ];

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    public function monHocTienQuyet()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_tien_quyet_id');
    }
}
