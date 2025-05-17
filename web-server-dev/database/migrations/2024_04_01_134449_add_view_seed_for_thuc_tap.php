<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddViewSeedForThucTap extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("drop view if exists ph_lop_sinh_vien_thuc_tap_do_an_views;");
        DB::statement("drop view if exists ph_lop_sinh_vien_thuc_tap_views;");
        DB::statement("drop view if exists ph_lop_sinh_vien_do_an_views;");
        DB::statement("
            CREATE OR REPLACE VIEW ph_lop_sinh_vien_thuc_tap_views AS
                select ph_lop_sinh_viens.sinh_vien_id, ph_lop_sinh_viens.lop_id,ph_lops.ma_hp,ph_lops.ki_hoc  from ph_lop_sinh_viens
                join ph_lops on ph_lops.id = ph_lop_sinh_viens.lop_id
                join ph_ma_hoc_phans on ph_lops.ma_hp = ph_ma_hoc_phans.ma
                where ph_ma_hoc_phans.is_thuc_tap = true;

        ");
        DB::statement("
            CREATE OR REPLACE VIEW ph_lop_sinh_vien_do_an_views AS
                select ph_lop_sinh_viens.sinh_vien_id, ph_lop_sinh_viens.lop_id,ph_lops.ma_hp,ph_lops.ki_hoc  from ph_lop_sinh_viens
                join ph_lops on ph_lops.id = ph_lop_sinh_viens.lop_id
                join ph_ma_hoc_phans on ph_lops.ma_hp = ph_ma_hoc_phans.ma
                where  ph_ma_hoc_phans.is_do_an_tot_nghiep = true;
        ");
        DB::statement("
            CREATE OR REPLACE VIEW ph_lop_sinh_vien_thuc_tap_do_an_views AS
            select
                COALESCE(ph_lop_sinh_vien_do_ans.giao_vien_id,do_an.giao_vien_id) as giao_vien_id,
                ph_lop_sinh_vien_thuc_tap_views.sinh_vien_id,
                ph_lop_sinh_vien_thuc_tap_views.lop_id as lop_thuc_tap_id,
                COALESCE(ph_lop_sinh_vien_do_ans.lop_id,do_an.lop_id) as lop_do_an_id,
                ph_lop_sinh_vien_thuc_tap_views.ki_hoc
            from ph_lop_sinh_vien_thuc_tap_views
                left join ph_lop_sinh_vien_do_an_views
                    on ph_lop_sinh_vien_thuc_tap_views.sinh_vien_id = ph_lop_sinh_vien_do_an_views.sinh_vien_id
                    and ph_lop_sinh_vien_thuc_tap_views.ki_hoc = ph_lop_sinh_vien_do_an_views.ki_hoc
                left join ph_lop_sinh_vien_do_ans on ph_lop_sinh_vien_do_an_views.lop_id =  ph_lop_sinh_vien_do_ans.lop_id and ph_lop_sinh_vien_do_an_views.sinh_vien_id =  ph_lop_sinh_vien_do_ans.sinh_vien_id
                left join ph_lop_sinh_vien_do_ans as do_an on ph_lop_sinh_vien_thuc_tap_views.lop_id =  do_an.lop_id and ph_lop_sinh_vien_thuc_tap_views.sinh_vien_id =  do_an.sinh_vien_id
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("drop view if exists ph_lop_sinh_vien_thuc_tap_do_an_views;");
        DB::statement("drop view if exists ph_lop_sinh_vien_thuc_tap_views;");
        DB::statement("drop view if exists ph_lop_sinh_vien_do_an_views;");
    }
}
