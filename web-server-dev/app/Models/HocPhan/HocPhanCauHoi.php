<?php

namespace App\Models\HocPhan;

use App\Enums\TrangThaiCauHoi;
use App\Models\Auth\User;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Log\LogActor;
use App\Models\Log\Logs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanCauHoi extends Model
{
    use HasFactory;

    protected $table = "hp_cau_hois";

    protected $fillable = ["noi_dung", "loai", "lua_chon", "dap_an", "created_by_id", "trang_thai", "is_machine"];

    protected $casts = [
        "lua_chon" => "array",
        "dap_an" => "array",
        "is_machine" => "boolean",
    ];
    protected $hidden = ["loi_giai"];
    public function createdBy()
    {
        return $this->belongsTo(User::class, "created_by_id");
    }

    public function chuongs()
    {
        return $this->hasMany(HocPhanCauHoiChuong::class, "cau_hoi_id");
    }
    public function cauHoiPhanBien()
    {
        return $this->hasMany(HocPhanCauHoiPhanBien::class, "cau_hoi_id");
    }

    public function phanBien()
    {
        return $this->hasOne(HocPhanCauHoiPhanBien::class, "cau_hoi_id")->latest();
    }

    public function baiThiCauHois()
    {
        return $this->hasMany(HocPhanBaiThiCauHoi::class, "cau_hoi_id");
    }

    public function primaryChuong()
    {
        return $this->hasOne(HocPhanCauHoiChuong::class, "cau_hoi_id", "id")
            ->where("is_primary", true)
            ->ofMany("cau_hoi_id", "max");
    }
    public function logActors()
    {
        return $this->morphMany(LogActor::class, "log_actor", "log_actor_type");
    }
    public function logs()
    {
        return $this->morphToMany(Logs::class, "log_actor", "l_log_actors", "log_actor_id", "log_id");
    }
    protected static function booted()
    {
        static::addGlobalScope("filterHuyBo", function ($query) {
            $query->whereNotIn("trang_thai", [TrangThaiCauHoi::HuyBo]);
        });
    }

    public function loaiThi()
    {
        return $this->hasMany(HocPhanCauHoiLoai::class, "cau_hoi_id", "id");
    }
    public function getLanPhanBienYeuCauAttribute()
    {
        switch ($this->trang_thai) {
            case TrangThaiCauHoi::ChoPhanBien:
                return 1;
            case TrangThaiCauHoi::ChoPhanBien2:
            case TrangThaiCauHoi::ChoDuyet2:
                return 2;

            default:
                return 1;
        }
    }
    public function scopeActive($query)
    {
        $query->whereNotIn("trang_thai", [TrangThaiCauHoi::HuyBo]);
    }
}
