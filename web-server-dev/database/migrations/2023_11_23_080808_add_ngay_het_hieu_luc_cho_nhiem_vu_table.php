<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNgayHetHieuLucChoNhiemVuTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("nv_nhiem_vus", function (Blueprint $table) {
            $table->date("ngay_het_hieu_luc")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("nv_nhiem_vus", function (Blueprint $table) {
            $table->dropColumn("ngay_het_hieu_luc");
        });
    }
}
