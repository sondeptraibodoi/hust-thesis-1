<?php

namespace App\Helpers;

use App\Enums\LoaiThi;
use App\Models\Lop\DiemDanh;
use App\Models\Lop\DiemDanhView;
use App\Models\Lop\DiemDanhViewCount;
use App\Models\Lop\Lop;
use DB;

class DiemChuyenCanHelper
{
    public static function tinhDiem(Lop $lop, $sinh_vien_id, $lop_id)
    {
        if ($lop->loai_thi == LoaiThi::Thi_Theo_Chuong) {
            return self::tinhDiemChuyenCanThiTheoChuong($sinh_vien_id, $lop_id);
        }
        if ($lop->is_dai_cuong) {
            return self::tinhDiemChuyenCan($sinh_vien_id, $lop_id);
        } else {
            $diem_chuyen_can = DiemChuyenCanHelper::tinhDiemChuyenCanCN($sinh_vien_id, $lop_id);
            $diem_chuyen_can = round($diem_chuyen_can, 2);
            return $diem_chuyen_can;
        }
    }
    protected static function getDiemChuyenCan($sinh_vien_id, $extras)
    {
        $data = $extras[$sinh_vien_id] ?? ["tong_so_buoi" => 0];
        $tong_so_buoi = $data["tong_so_buoi"] ?? 0;
        if ($tong_so_buoi == 0) {
            return 10;
        }
        if ($tong_so_buoi < 4) {
            $tong_so_buoi = 8;
        }
        // $vang_mat = $query->where('co_mat', false)->count();
        // $diem_tru =  ($vang_mat / 8) * 10;

        // $diem_chuyen_can = 10 - $diem_tru;

        $co_mat = $data["so_buoi_co_mat"];
        $vang_mat = $data["so_buoi_vang"];
        if ($tong_so_buoi <= 8) {
            $diem_tru = ($vang_mat / 8) * 10;
            $diem_chuyen_can = 10 - $diem_tru;
        } else {
            $diem_chuyen_can = ($co_mat / $tong_so_buoi) * 10;
        }

        $diem_chuyen_can = round($diem_chuyen_can * 2) / 2;

        return $diem_chuyen_can;
    }
    protected static function tinhDiemChuyenCan($sinh_vien_id, $lop_id)
    {
        $data = DiemDanhViewCount::query()->where("sinh_vien_id", $sinh_vien_id)->where("lop_id", $lop_id)->first();
        if (empty($data)) {
            return 10;
        }

        $tong_so_buoi = $data->tong_so_buoi;
        if ($tong_so_buoi == 0) {
            return 10;
        }
        if ($tong_so_buoi < 4) {
            $tong_so_buoi = 8;
        }
        $co_mat = $data->so_buoi_co_mat;
        $vang_mat = $data->so_buoi_vang;
        if ($tong_so_buoi <= 8) {
            $diem_tru = ($vang_mat / 8) * 10;
            $diem_chuyen_can = 10 - $diem_tru;
        } else {
            $diem_chuyen_can = ($co_mat / $tong_so_buoi) * 10;
        }

        $diem_chuyen_can = round($diem_chuyen_can * 2) / 2;

        return $diem_chuyen_can;
    }
    protected static function tinhDiemChuyenCanCN($sinh_vien_id, $lop_id)
    {
        $query = DiemDanhView::query()->where("sinh_vien_id", $sinh_vien_id)->where("lop_id", $lop_id);
        $tong_so_buoi = $query->count();
        if ($tong_so_buoi == 0) {
            return 10;
        }
        $co_mat = $query->where("co_mat", true)->count();

        $diem_chuyen_can = ($co_mat / $tong_so_buoi) * 10;
        $diem_chuyen_can = round($diem_chuyen_can * 2) / 2;
        return $diem_chuyen_can;
    }
    protected static function tinhDiemChuyenCanThiTheoChuong($sinh_vien_id, $lop_id)
    {
        $query = DiemDanhView::query()->where("sinh_vien_id", $sinh_vien_id)->where("lop_id", $lop_id);
        $tong_so_buoi = $query->count();
        if ($tong_so_buoi == 0) {
            return 1;
        }
        $vang_mat = $query->where("co_mat", false)->count();
        if ($vang_mat == 0) {
            return 1;
        }
        if ($vang_mat <= 2) {
            return 0;
        }
        if ($vang_mat <= 4) {
            return -1;
        }
        return -2;
    }
}
