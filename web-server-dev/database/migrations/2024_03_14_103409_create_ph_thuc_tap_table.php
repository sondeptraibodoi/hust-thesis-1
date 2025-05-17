<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePhThucTapTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("ph_thuc_tap", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->string("ten_cong_ty");
            $table->text("dia_chi")->nullable();
            $table->text("ghi_chu")->nullable();
            $table->string("trang_thai")->default("0-moi-gui");
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
        Schema::dropIfExists("ph_thuc_tap");
    }
}
