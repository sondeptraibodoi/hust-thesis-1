<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLopThiGocIdToLopThiSinhVienTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("ph_lop_thi_sinh_viens", function (Blueprint $table) {
            $table->foreignId("lop_thi_goc_id")->nullable()->constrained("ph_lop_this");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("ph_lop_thi_sinh_viens", function (Blueprint $table) {
            $table->dropColumn("lop_thi_goc_id");
        });
    }
}
