<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePhLopSinhVienDoAnsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("ph_lop_sinh_vien_do_ans", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->foreignId("giao_vien_id")->constrained("u_giao_viens")->onDelete("cascade");
            $table->string("ten_de_tai")->nullable();
            $table->text("noi_dung")->nullable();
            $table->text("cac_moc_quan_trong")->nullable();
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
        Schema::dropIfExists("ph_lop_sinh_vien_do_ans");
    }
}
