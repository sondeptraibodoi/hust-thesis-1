<?php

namespace App\Helpers;

use App\Enums\LoaiThi;
use App\Models\Diem\Diem;
use App\Models\Lop\Lop;
use App\Models\User\SinhVien;
use DB;
use Log;
use Exception;

class DiemQTHelper
{
    //3 đầu điểm GK GK2 CK
    public static function getDiem($item)
    {
        $diem = $item["diem"] ?? null;
        if (isset($item["ghi_chu"])) {
            $ghi_chu = $item["ghi_chu"];
            if (is_string($item["ghi_chu"])) {
                $ghi_chu = json_decode($ghi_chu, true);
            }
            if (isset($ghi_chu["diem_phuc_khao"])) {
                $diem = $ghi_chu["diem_phuc_khao"];
            } elseif (isset($ghi_chu) && isset($ghi_chu["diem_thi_bu"]) && $ghi_chu["diem_thi_bu"] >= 0) {
                $diem = $ghi_chu["diem_thi_bu"];
            }
        }
        if ($diem < 0) {
            $diem = "-";
        }
        return $diem;
    }
    public static function getExtra($lop_id, $sinh_vien_id = null)
    {
        $query = DB::table("ph_lop_sinh_viens")->select(
            DB::raw("ph_lop_sinh_viens.sinh_vien_id as sinh_vien_id"),
            DB::raw("ph_lop_sinh_viens.lop_id as lop_id"),
            DB::raw("ph_lop_sinh_viens.diem_y_thuc as diem_y_thuc"),
            DB::raw("ph_lop_sinh_viens.diem")
        );
        $query->where("ph_lop_sinh_viens.lop_id", $lop_id);
        if (!empty($sinh_vien_id)) {
            $query->where("ph_lop_sinh_viens.sinh_vien_id", $sinh_vien_id);
        }
        return $query->get()->mapWithKeys(function ($item) {
            return [
                $item->sinh_vien_id => [
                    "diem" => $item->diem,
                    "diem_y_thuc" => $item->diem_y_thuc,
                ],
            ];
        });
    }
    public static function getExtraForLops($lop_ids)
    {
        $query = DB::table("ph_lop_sinh_viens")->select(
            DB::raw("ph_lop_sinh_viens.sinh_vien_id as sinh_vien_id"),
            DB::raw("ph_lop_sinh_viens.lop_id as lop_id"),
            DB::raw("ph_lop_sinh_viens.diem_y_thuc as diem_y_thuc"),
            DB::raw("ph_lop_sinh_viens.diem")
        );
        $query->whereIn("ph_lop_sinh_viens.lop_id", $lop_ids);
        return $query->get()->reduce(function ($acc, $item) {
            if (empty($acc[$item->sinh_vien_id])) {
                $acc[$item->sinh_vien_id] = [];
            }
            $acc[$item->lop_id][$item->sinh_vien_id] = [
                "diem" => $item->diem,
                "diem_y_thuc" => $item->diem_y_thuc,
            ];
            return $acc;
        }, []);
    }

    // lam tron xuong
    static function round($diem)
    {
        if (!empty($diem)) {
            return 0;
        }
        return round($diem * 2) / 2;
    }
    // lam tron len
    static function ceil($diem)
    {
        $integerPart = floor($diem);
        $decimalPart = $diem - $integerPart;

        // Làm tròn dựa trên phần thập phân
        if ($decimalPart < 0.5) {
            return $integerPart; // Làm tròn xuống nếu phần thập phân nhỏ hơn 0.5
        } else {
            return $integerPart + 1; // Làm tròn lên nếu phần thập phân lớn hơn hoặc bằng 0.5
        }
    }
}
