<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDiemHocPhanChuongsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_sinh_vien_chuong_diem", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->float("diem")->nullable();
            $table->foreignId("chuong_id")->constrained("hp_chuongs");
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
        Schema::dropIfExists("hp_sinh_vien_chuong_diem");
    }
}
