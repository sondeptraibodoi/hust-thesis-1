<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSinhVIenGiaoVienPhanBien extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("ph_lop_sinh_vien_giao_vien_phan_bien", function (Blueprint $table) {
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->foreignId("giao_vien_id")->constrained("u_giao_viens")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("ph_lop_sinh_viens");
    }
}
