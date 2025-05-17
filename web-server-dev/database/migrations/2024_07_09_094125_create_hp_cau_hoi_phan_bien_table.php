<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpCauHoiPhanBienTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_cau_hoi_phan_bien", function (Blueprint $table) {
            $table->unsignedBigInteger("cau_hoi_id");
            $table->foreign("cau_hoi_id")->references("id")->on("hp_cau_hois")->onDelete("cascade");
            $table->unsignedBigInteger("giao_vien_id");
            $table->foreign("giao_vien_id")->references("id")->on("u_giao_viens")->onDelete("cascade");
            $table->date("ngay_giao")->nullable();
            $table->string("trang_thai_cau_hoi")->nullable();
            $table->text("ly_do")->nullable();
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
        Schema::dropIfExists("hp_cau_hoi_phan_bien");
    }
}
