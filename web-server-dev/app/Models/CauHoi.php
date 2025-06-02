<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CauHoi extends Model
{
    use HasFactory;

    protected $table = 'cau_hoi';
    protected $primaryKey = 'cau_hoi_id';
    public $timestamps = false;
    protected $fillable = ['noi_dung', 'do_kho', 'mon_hoc_id'];

    public function dapAn()
    {
        return $this->hasMany(DapAn::class, 'cau_hoi_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }
}
