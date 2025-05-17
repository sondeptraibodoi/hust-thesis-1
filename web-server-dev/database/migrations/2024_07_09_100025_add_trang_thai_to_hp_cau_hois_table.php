<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTrangThaiToHpCauHoisTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_cau_hois", function (Blueprint $table) {
            $table->string("trang_thai")->default("moi_tao");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_cau_hois", function (Blueprint $table) {
            $table->dropColumn("trang_thai");
        });
    }
}
