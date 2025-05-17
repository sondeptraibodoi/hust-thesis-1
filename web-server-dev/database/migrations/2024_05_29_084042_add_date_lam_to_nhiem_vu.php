<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDateLamToNhiemVu extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("nv_nhiem_vus", function (Blueprint $table) {
            $table->date("ngay_thuc_hien")->nullable();
        });
        DB::statement("update nv_nhiem_vus set ngay_thuc_hien = date(updated_at) ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("nv_nhiem_vus", function (Blueprint $table) {
            $table->dropColumn("ngay_thuc_hien");
        });
    }
}
