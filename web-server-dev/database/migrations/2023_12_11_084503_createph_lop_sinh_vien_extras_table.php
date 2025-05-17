<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatephLopSinhVienExtrasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("ph_lop_sinh_vien_extras", function (Blueprint $table) {
            $table->foreignId("lop_id")->constrained("ph_lops")->onDelete("cascade");
            $table->foreignId("sinh_vien_id")->constrained("u_sinh_viens")->onDelete("cascade");
            $table->string("type")->default("khong_tinh_chuyen_can");
            $table->text("note")->nullable();
            $table->unique(["lop_id", "sinh_vien_id", "type"]);
            $table->index(["lop_id"]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("ph_lop_sinh_vien_extras");
    }
}
