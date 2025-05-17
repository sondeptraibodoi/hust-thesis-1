<?php

namespace App\Models\HocPhan;

use App\Enums\LoaiBaiThi;
use App\Enums\TrangThaiCauHoi;
use App\Models\Lop\MaHocPhan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanCauHoiChuong extends Model
{
    use HasFactory;
    use \Awobaz\Compoships\Compoships;

    protected $table = "hp_cau_hoi_chuong";
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = "cau_hoi_id";
    protected $fillable = ["ma_hoc_phan", "cau_hoi_id", "chuong_id", "do_kho", "is_primary"];

    public function cauHoi()
    {
        return $this->belongsTo(HocPhanCauHoi::class, "cau_hoi_id");
    }

    public function chuong()
    {
        return $this->belongsTo(HocPhanChuong::class, "chuong_id");
    }

    public function maHp()
    {
        return $this->belongsTo(MaHocPhan::class, "ma_hoc_phan", "ma");
    }
    public function loaiThi()
    {
        return $this->belongsTo(HocPhanCauHoiLoai::class, ["cau_hoi_id", "ma_hoc_phan"], ["cau_hoi_id", "ma_hoc_phan"]);
    }

    public function scopeActive($query): void
    {
        $query->whereHas("cauHoi", function ($query) {
            $query->where("trang_thai", TrangThaiCauHoi::DangSuDung);
        });
    }
    public function scopeByLoaiThi($query, $loai_thi, $chuong_id): void
    {
        $query->whereHas("cauHoi", function ($query) {
            $query->where("trang_thai", TrangThaiCauHoi::DangSuDung);
        });
        if ($loai_thi === LoaiBaiThi::THU) {
            $query->whereHas("cauHoi.loaiThi", function ($query) use ($chuong_id) {
                $query->where("chuong_id", $chuong_id);
                $query->where("loai", LoaiBaiThi::THU);
            });
        }
        // else {
        //     $query->where(function ($query) use ($chuong_id) {
        //         $query->whereHas("cauHoi.loaiThi", function ($query) use ($chuong_id) {
        //             $query->where("chuong_id", $chuong_id);
        //             $query->where("loai", LoaiBaiThi::THAT)->orWhere("loai", "");
        //         });
        //         $query->orDoesntHave("cauHoi.loaiThi");
        //     });
        // }
    }
}
