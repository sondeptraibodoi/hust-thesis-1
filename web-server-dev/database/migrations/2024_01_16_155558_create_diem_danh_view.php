<?php

use Illuminate\Database\Migrations\Migration;

class CreateDiemDanhView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("DROP VIEW IF EXISTS diem_danh_view");
        DB::statement("CREATE OR REPLACE VIEW diem_danh_view as select ph_diem_danhs.id,ph_diem_danhs.sinh_vien_id,ph_diem_danhs.lop_id,ph_diem_danhs.ma_lop,CASE WHEN ph_lop_sinh_vien_extras.type = 'khong_tinh_chuyen_can' THEN false ELSE ph_diem_danhs.co_mat END as co_mat, ph_diem_danhs.co_mat as old_co_mat from ph_diem_danhs
			left join ph_lan_diem_danhs on ph_lan_diem_danhs.id = ph_diem_danhs.lan_diem_danh_id
			left join ph_lop_sinh_vien_extras
            on ph_lop_sinh_vien_extras.sinh_vien_id = ph_diem_danhs.sinh_vien_id
                and ph_lop_sinh_vien_extras.parent_lop_id = ph_lan_diem_danhs.lop_id
                and ph_lop_sinh_vien_extras.type = 'khong_tinh_chuyen_can'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP VIEW IF EXISTS diem_danh_view");
    }
}
