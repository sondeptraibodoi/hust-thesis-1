<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLopGocIdTophLopSinhVienTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("ph_lop_sinh_viens", function (Blueprint $table) {
            $table->foreignId("lop_goc_id")->nullable()->constrained("ph_lops");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("ph_lop_sinh_viens", function (Blueprint $table) {
            $table->dropColumn("lop_goc_id");
        });
    }
}
