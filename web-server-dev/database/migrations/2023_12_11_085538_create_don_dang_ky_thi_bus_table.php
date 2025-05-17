<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDonDangKyThiBusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("sv_don_dang_ky_thi_bus", function (Blueprint $table) {
            $table->id();
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->string("ki_hoc", 5);
            $table->string("dot_thi", 10);
            $table->string("trang_thai")->default("chua_xac_nhan");
            $table->text("ly_do")->nullable();
            $table->text("phan_hoi")->nullable();
            $table->timestamps();
            $table->index(["lop_id"]);
            $table->index(["sinh_vien_id"]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("sv_don_dang_ky_thi_bus");
    }
}
