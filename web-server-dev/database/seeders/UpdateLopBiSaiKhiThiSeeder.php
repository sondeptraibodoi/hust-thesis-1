<?php

namespace Database\Seeders;

use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\Diem\DiemHocPhanChuong;
use DB;
use Illuminate\Database\Seeder;
use Storage;

class UpdateLopBiSaiKhiThiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $res = [];
        $results = DB::select(
            DB::raw(
                "select ma_hp,sinh_vien_id,STRING_AGG(CAST(lop_id AS TEXT), ',') AS lop_ids,count(*) from (
                select ph_lops.ma_hp,sinh_vien_id,lop_id,count(*) from public.hp_bai_this
                join ph_lops on ph_lops.id = hp_bai_this.lop_id
                group by sinh_vien_id,lop_id, ph_lops.ma_hp
                order by ph_lops.ma_hp,sinh_vien_id)a

                group by sinh_vien_id,ma_hp
                having count(*) > 1
                order by sinh_vien_id"
            )
        );
        foreach ($results as $result) {
            $item = [];
            $lop_ids = explode(",", $result->lop_ids);
            $item["result"] = $result;
            if ($result->count == 2) {
                $lop_chinh = $lop_ids[0];
                $lop_sai = $lop_ids[1];
                $count_lop_1 = HocPhanBaiThi::where("sinh_vien_id", $result->sinh_vien_id)
                    ->where("lop_id", $lop_ids[0])
                    ->count();
                $count_lop_2 = HocPhanBaiThi::where("sinh_vien_id", $result->sinh_vien_id)
                    ->where("lop_id", $lop_ids[1])
                    ->count();

                $item[$lop_ids[0]] = $count_lop_1;
                $item[$lop_ids[1]] = $count_lop_2;
                if ($count_lop_2 > $count_lop_1) {
                    $lop_chinh = $lop_ids[1];
                    $lop_sai = $lop_ids[0];
                }
                $item["lop_chinh"] = $lop_chinh;
                $item["lop_sai"] = $lop_sai;
                $item["count_bai_thi_update"] = HocPhanBaiThi::where("sinh_vien_id", $result->sinh_vien_id)
                    ->where("lop_id", $lop_sai)
                    ->update(["lop_id" => $lop_chinh]);
                $item["count_diem_update"] = DiemHocPhanChuong::where("sinh_vien_id", $result->sinh_vien_id)
                    ->where("lop_id", $lop_sai)
                    ->update(["lop_id" => $lop_chinh]);
            }
            $res[] = $item;
        }
        Storage::disk()->put("update-bai-thi-sinh-vien.json", json_encode($res));
    }
}
