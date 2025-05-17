<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNhomToTlLoaiTaiLieusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tl_loai_tai_lieus", function (Blueprint $table) {
            $table->string("nhom")->nullable()->after("loai");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("tl_loai_tai_lieus", function (Blueprint $table) {
            $table->dropColumn("nhom");
        });
    }
}
