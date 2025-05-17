<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddThoiGianCongKhaiToDiemHocPhanChuongTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_sinh_vien_chuong_diem", function (Blueprint $table) {
            $table->dateTime("thoi_gian_cong_khai")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_sinh_vien_chuong_diem", function (Blueprint $table) {
            $table->dropColumn("thoi_gian_cong_khai");
        });
    }
}
