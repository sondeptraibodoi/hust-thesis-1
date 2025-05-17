<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpBaiThisTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_bai_this", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lop_id")->constrained("ph_lops");
            $table->foreignId("chuong_id")->constrained("hp_chuongs");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens");
            $table->date("bat_dau_thi_at")->nullable();
            $table->date("ket_thuc_thi_at")->nullable();
            $table->integer("thoi_gian_thi_cho_phep")->nullable();
            $table->string("loai")->nullable(); // thi_thu|thi_that
            $table->string("code")->nullable(); // mã sinh đề encode/decode
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("hp_bai_this");
    }
}
