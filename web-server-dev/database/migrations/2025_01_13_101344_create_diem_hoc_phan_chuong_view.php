<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDiemHocPhanChuongView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
            CREATE VIEW hp_sinh_vien_chuong_diem_view AS
            select * from hp_sinh_vien_chuong_diem
            where (thoi_gian_cong_khai is null or (thoi_gian_cong_khai AT TIME ZONE 'Asia/Bangkok') <= NOW())
            ;
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("drop view if exists hp_sinh_vien_chuong_diem_view");
    }
}
