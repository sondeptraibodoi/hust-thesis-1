<?php

namespace App\Helpers;

use App\Models\Diem\Diem;
use App\Models\Lop\DiemDanh;
use App\Models\Lop\DiemPhucKhao;
use DB;

class DiemHelper
{
    public static function updateDiemPhucKhao($lop_thi_id, $sinh_vien_id, $diem_phuc_khao, $other = [])
    {
        DiemPhucKhao::updateOrCreate(
            [
                "lop_thi_id" => $lop_thi_id,
                "sinh_vien_id" => $sinh_vien_id,
            ],
            array_merge($other, [
                "diem" => $diem_phuc_khao,
            ])
        );
        $lop_thi_goc = DB::table("ph_lop_thi_sinh_viens")
            ->where("lop_thi_id", $lop_thi_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->whereNotNull("lop_thi_goc_id")
            ->first();
        $diem = Diem::where([
            "lop_thi_id" => $lop_thi_id,
            "sinh_vien_id" => $sinh_vien_id,
        ])->first();
        $ghi_chu = array_merge($diem->ghi_chu ?? [], [
            "diem_phuc_khao" => $diem_phuc_khao,
        ]);
        $diem->update(["ghi_chu" => $ghi_chu]);
        if ($lop_thi_goc) {
            $lop_thi_goc_id = $lop_thi_goc->lop_thi_goc_id;
            $diem_db = Diem::where([
                "lop_thi_id" => $lop_thi_goc_id,
                "sinh_vien_id" => $sinh_vien_id,
            ])->firstOrCreate();
            $ghi_chu = array_merge($diem_db->ghi_chu ?? [], [
                "diem_phuc_khao" => $diem_phuc_khao,
            ]);
            $diem_db->update(["ghi_chu" => $ghi_chu]);
        }
    }
    public static function getQueryDiem($option = [])
    {
        $check_phuc_khao = $option["check_phuc_khao"] ?? false;
        $query = DB::query()->fromSub(function ($query) use ($check_phuc_khao) {
            $query
                ->from("ph_diems")
                ->join("u_sinh_viens", "ph_diems.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lop_this", "ph_diems.lop_thi_id", "=", "ph_lop_this.id")
                ->join("ph_lops", "ph_lop_this.lop_id", "=", "ph_lops.id")
                ->join("d_bang_diems", "ph_diems.bang_diem_id", "=", "d_bang_diems.id");
            $query->leftJoin("ph_diem_phuc_khaos", function ($join) {
                $join->on("ph_diem_phuc_khaos.sinh_vien_id", "=", "ph_diems.sinh_vien_id");
                $join->on("ph_diem_phuc_khaos.lop_thi_id", "=", "ph_diems.lop_thi_id");
            });
            $query->orderBy("ph_diems.id");
            $query->select([
                "ph_diems.id",
                "ph_diems.sinh_vien_id",
                "u_sinh_viens.mssv",
                "ph_diems.diem",
                DB::raw("ph_diem_phuc_khaos.diem as diem_phuc_khao"),
                DB::raw("ph_lops.ma as ma_lop"), //lop
                DB::raw("ph_lop_this.ma as ma_lop_thi"), //lop thi
                DB::raw("ph_lop_this.loai as loai_lop_thi"), //dot lop thi
                DB::raw("ph_lops.id as lop_id"), //lop
                DB::raw("ph_lop_this.id as lop_thi_id"), //lop thi
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc",
                "d_bang_diems.ngay_ket_thuc_phuc_khao",
                DB::raw("CASE WHEN d_bang_diems.ma_hp = 'chuyen_nganh' THEN 1 ELSE 0 END AS is_chuyen_nganh"),
                DB::raw("CASE WHEN ngay_cong_khai <= NOW() THEN 1 ELSE 0 END AS is_cong_khai"),
                DB::raw(
                    "CASE WHEN to_date(ngay_ket_thuc_phuc_khao::TEXT, 'YYYY-MM-DD') >= to_date(NOW()::TEXT, 'YYYY-MM-DD') THEN TRUE ELSE FALSE END AS is_phuc_khao"
                ),
            ]);
            if ($check_phuc_khao) {
                $query->leftJoin("pk_phuc_khaos", function ($join) {
                    $join->on("pk_phuc_khaos.sinh_vien_id", "=", "ph_diems.sinh_vien_id");
                    $join->on("pk_phuc_khaos.lop_thi_id", "=", "ph_diems.lop_thi_id");
                });
                $query->addSelect(
                    DB::raw("pk_phuc_khaos.trang_thai as trang_thai_phuc_khao"),
                    DB::raw("pk_phuc_khaos.ma_thanh_toan as ma_thanh_toan_phuc_khao")
                );
            }
        }, "bang_diems");
        return $query;
    }
}
