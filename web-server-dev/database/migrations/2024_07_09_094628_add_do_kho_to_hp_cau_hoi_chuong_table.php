<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDoKhoToHpCauHoiChuongTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_cau_hoi_chuong", function (Blueprint $table) {
            $table->string("do_kho")->default("easy");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_cau_hoi_chuong", function (Blueprint $table) {
            $table->dropColumn("do_kho");
        });
    }
}
