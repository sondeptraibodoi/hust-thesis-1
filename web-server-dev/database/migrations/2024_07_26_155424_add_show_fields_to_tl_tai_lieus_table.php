<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddShowFieldsToTlTaiLieusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tl_tai_lieus", function (Blueprint $table) {
            $table->boolean("show_sinh_vien")->default(true)->after("noi_dung");
            $table->boolean("show_giao_vien")->default(true)->after("show_sinh_vien");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("tl_tai_lieus", function (Blueprint $table) {
            $table->dropColumn("show_sinh_vien");
            $table->dropColumn("show_giao_vien");
        });
    }
}
