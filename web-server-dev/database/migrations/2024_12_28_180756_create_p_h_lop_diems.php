<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePHLopDiems extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("ph_lop_sinh_vien_diems", function (Blueprint $table) {
            $table->id();
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->float("diem")->nullable();
            $table->string("loai")->nullable();
            $table->timestamps();
            $table->index(["lop_id", "sinh_vien_id", "loai"]);
            $table->unique(["lop_id", "sinh_vien_id", "loai"]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("ph_lop_sinh_vien_diems");
    }
}
