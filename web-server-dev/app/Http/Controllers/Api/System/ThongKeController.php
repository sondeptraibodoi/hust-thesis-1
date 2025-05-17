<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\BaoLoi\BaoLoi;
use App\Models\Lop\Lop;
use App\Models\Lop\ThucTap;
use App\Models\NhiemVu\NhiemVu;
use DB;

class ThongKeController extends Controller
{
    public function thongKeDuLieu($kiHoc)
    {
        $totalBaoLoi = BaoLoi::where("trang_thai", 0)->where("ki_hoc", $kiHoc)->count();

        $totalLop = Lop::where("ki_hoc", $kiHoc)->count();

        $totalSVThucTap = ThucTap::join("ph_lops", "ph_thuc_tap.lop_id", "=", "ph_lops.id")
            ->where("ph_lops.ki_hoc", $kiHoc)
            ->where("ph_thuc_tap.trang_thai", "0-moi-gui")
            ->count();

        $totalChuaDangKy = DB::table("ph_lop_sinh_viens")
            ->join("ph_lops", "ph_lops.id", "=", "ph_lop_sinh_viens.lop_id")
            ->join(
                "ph_ma_hoc_phans",
                DB::raw("CAST(ph_lops.ma_hp AS TEXT)"),
                "=",
                DB::raw("CAST(ph_ma_hoc_phans.ma AS TEXT)")
            )
            ->where("ph_ma_hoc_phans.is_thuc_tap", true)
            ->where("ph_lops.ki_hoc", $kiHoc)
            ->count();

        $totalChuaDangKyThucTap = $totalChuaDangKy - $totalSVThucTap;

        $totalNhiemVuDaLam = NhiemVu::where("trang_thai", "da_lam")
            ->whereJsonContains("noi_dung->ki_hoc", $kiHoc)
            ->count();
        // $totalNhiemVuQuaHan = NhiemVu::where('trang_thai', 'qua_han')->whereJsonContains('noi_dung->ki_hoc', $kiHoc)->count();
        $totalNhiemVuQuaHan = DB::table("nv_nhiem_vus")
            ->whereRaw(
                "
            CASE 
                WHEN to_date(ngay_het_hieu_luc::TEXT, 'YYYY-MM-DD') < to_date(NOW()::TEXT, 'YYYY-MM-DD') 
                    AND trang_thai = 'da_giao' 
                THEN 'qua_han' 
                ELSE trang_thai 
            END = 'qua_han'
        "
            )
            ->whereJsonContains("noi_dung->ki_hoc", $kiHoc)
            ->count();
        $totalNhiemVu = NhiemVu::whereJsonContains("noi_dung->ki_hoc", $kiHoc)->count();

        return response()->json([
            "totalBaoLoi" => $totalBaoLoi,
            "totalLop" => $totalLop,
            "totalSVThucTap" => $totalSVThucTap,
            "totalChuaDangKyThucTap" => $totalChuaDangKyThucTap,
            "totalNhiemVuDaLam" => $totalNhiemVuDaLam,
            "totalNhiemVuQuaHan" => $totalNhiemVuQuaHan,
            "totalNhiemVu" => $totalNhiemVu,
        ]);
    }
}
