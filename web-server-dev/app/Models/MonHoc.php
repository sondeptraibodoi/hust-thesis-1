<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonHoc extends Model
{
    use HasFactory;
    protected $table = 'mon_hoc';
    protected $primaryKey = 'mon_hoc_id';
    public $timestamps = true;

    protected $fillable = ['ten_mon_hoc', 'created_at'];

    // Nếu muốn định nghĩa mối quan hệ:
    public function cauHois()
    {
        return $this->hasMany(CauHoi::class, 'mon_hoc_id');
    }
}
