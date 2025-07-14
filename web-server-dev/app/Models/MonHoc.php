<?php

namespace App\Models;

use DB;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Request;

class MonHoc extends Model
{
    use HasFactory;
    protected $table = 'mon_hocs';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = ['ten_mon_hoc', 'ma','created_at'];

    // Nếu muốn định nghĩa mối quan hệ:
    public function level()
    {
        return DB::table('level_mon_hoc')->where('nguoi_dung_id',Request::user()->id)->where('mon_hoc_id', $this->id)->max('level');
    }

    public function cauHois()
    {
        return $this->hasMany(CauHoi::class, 'mon_hoc_id');
    }

    public function soCau()
    {
        return $this->cauHois()->count();
    }
}
