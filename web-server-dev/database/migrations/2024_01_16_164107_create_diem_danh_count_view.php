<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDiemDanhCountView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("DROP VIEW IF EXISTS diem_danh_view_count");
        DB::statement("CREATE OR REPLACE VIEW diem_danh_view_count as select lop_id,sinh_vien_id,count(*) as tong_so_buoi,
            sum(case when co_mat then  1 else 0 end ) as so_buoi_co_mat ,
            sum(case when co_mat then  0 else 1 end ) as so_buoi_vang
            from diem_danh_view group by lop_id,sinh_vien_id");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP VIEW IF EXISTS diem_danh_view_count");
    }
}
