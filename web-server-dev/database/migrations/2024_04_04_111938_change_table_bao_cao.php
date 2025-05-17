<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeTableBaoCao extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists("ph_do_an_bao_caos");
        Schema::dropIfExists("ph_do_an_lan_bao_caos");
        Schema::create("ph_do_an_bao_caos", function (Blueprint $table) {
            $table->id();
            $table->string("ki_hoc");
            $table->integer("lan");
            $table->dateTime("ngay_bao_cao");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->text("noi_dung_thuc_hien")->nullable();
            $table->text("noi_dung_da_thuc_hien")->nullable();
            $table->text("ghi_chu")->nullable();
            $table->float("diem_y_thuc")->nullable();
            $table->float("diem_noi_dung")->nullable();
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
        Schema::dropIfExists("ph_do_an_bao_caos");
    }
}
