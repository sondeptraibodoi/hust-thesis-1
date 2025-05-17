<?php

namespace App\Models\Lop;

// use App\Models\DoAnBaoCao\DoAnLanBaoCao;
// use App\Models\MaHocPhan\MaHocPhan;

use App\Models\DoAnBaoCao\DoAnBaoCao;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\Lop\MaHocPhan;
use App\Models\HocPhan\HocPhanChuong;
use App\Models\TaiLieu\TlTaiLieu;
use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use DB;
use Illuminate\Database\Eloquent\Model;

class Lop extends Model
{
    use \Awobaz\Compoships\Compoships;
    const INCLUDE = ["giaoViens", "sinhViens", "lanDiemDanhs", "children", "parent", "sinhVienExtras", "maHocPhan"];
    protected $table = "ph_lops";
    protected $fillable = [
        "ma",
        "ma_kem",
        "ma_hp",
        "ten_hp",
        "phong",
        "loai",
        "tuan_hoc",
        "ki_hoc",
        "ghi_chu",
        "tuan_hoc",
        "is_dai_cuong",
        "loai_thi",
    ];
    protected $casts = [
        "is_dai_cuong" => "boolean",
    ];
    public function giaoViens()
    {
        return $this->belongsToMany(GiaoVien::class, "ph_lop_giao_viens")->withPivot("ghi_chu");
    }
    public function sinhViens()
    {
        return $this->belongsToMany(SinhVien::class, "ph_lop_sinh_viens")
            ->withPivot("stt", "diem_y_thuc", "nhom", "diem", "lop_goc_id")
            ->orderByPivot("stt");
    }
    public function sinhVienExtras()
    {
        return $this->belongsToMany(SinhVien::class, "ph_lop_sinh_vien_extras", "parent_lop_id")->withPivot(
            "type",
            "note",
            "lop_id"
        );
    }
    public function lanDiemDanhs()
    {
        return $this->hasMany(LanDiemDanh::class)->orderBy("lan");
    }
    public function lanDiemDanhMoiNhat()
    {
        return $this->hasOne(LanDiemDanh::class)->ofMany([
            "created_at" => "max",
            "id" => "max",
        ]);
    }
    public function children()
    {
        return $this->hasMany(Lop::class, ["ma_kem", "ki_hoc"], ["ma", "ki_hoc"])
            ->whereRaw("ma != ma_kem")
            ->where("loai", "!=", "TN");
    }
    public function parent()
    {
        return $this->belongsTo(Lop::class, ["ma_kem", "ki_hoc"], ["ma", "ki_hoc"]);
    }
    public function lopGiaoVien()
    {
        return $this->hasMany(LopGiaoVien::class);
    }

    public function maHocPhan()
    {
        return $this->belongsTo(MaHocPhan::class, "ma_hp", "ma");
    }

    public function lopSinhVienDoAn()
    {
        return $this->hasMany(LopSinhVienDoAn::class);
    }

    public function doAnBaoCao()
    {
        return $this->hasMany(DoAnBaoCao::class);
    }

    // public function doAnLanBaoCao()
    // {
    //     return $this->hasMany(DoAnLanBaoCao::class);
    // }

    public function taiLieus()
    {
        return $this->belongsToMany(TlTaiLieu::class, "tl_tai_lieu_lop_mon", "lop_id", "tai_lieu_id");
    }

    public function hocPhanChuongs()
    {
        return $this->hasMany(HocPhanChuong::class, "ma_hoc_phan", "ma_hp");
    }
    public function giaoVienPhanBien()
    {
        return $this->hasMany(LopGiaoVienPhanBien::class, "lop_id");
    }

    public function baiThi()
    {
        return $this->hasMany(HocPhanBaiThi::class, "lop_id");
    }
}
