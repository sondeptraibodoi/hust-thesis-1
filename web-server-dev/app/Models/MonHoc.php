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

    protected $fillable = [
        'ten_mon_hoc',
        'ma',
        'so_tin_chi',
        'diem_qua_mon',
        'bat_buoc',
        'trang_thai',
        'created_at',
    ];

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

    public function lopHocPhans()
    {
        return $this->hasMany(LopHocPhan::class, 'mon_hoc_id');
    }

    public function chuongTrinhDaoTaos()
    {
        return $this->belongsToMany(ChuongTrinhDaoTao::class, 'chuong_trinh_mon_hoc', 'mon_hoc_id', 'chuong_trinh_dao_tao_id')
            ->withPivot(['hoc_ky_goi_y', 'bat_buoc'])
            ->withTimestamps();
    }

    public function monHocTienQuyets()
    {
        return $this->belongsToMany(MonHoc::class, 'mon_hoc_tien_quyet', 'mon_hoc_id', 'mon_hoc_tien_quyet_id')
            ->withPivot('loai_dieu_kien')
            ->withTimestamps();
    }

    public function monHocPhuThuocs()
    {
        return $this->belongsToMany(MonHoc::class, 'mon_hoc_tien_quyet', 'mon_hoc_tien_quyet_id', 'mon_hoc_id')
            ->withPivot('loai_dieu_kien')
            ->withTimestamps();
    }
}
