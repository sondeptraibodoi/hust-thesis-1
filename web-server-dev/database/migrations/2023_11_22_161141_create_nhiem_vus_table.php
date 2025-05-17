<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNhiemVusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("nv_nhiem_vus", function (Blueprint $table) {
            $table->id();
            $table->string("tieu_de");
            $table->foreignId("nguoi_tao_id")->index()->constrained("users")->nullOnDelete();
            $table->foreignId("nguoi_lam_id")->index()->constrained("users")->nullOnDelete();
            $table->string("trang_thai")->default("da_giao");
            $table->string("loai")->default("phuc_khao");
            $table->json("noi_dung");
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
        Schema::dropIfExists("nv_nhiem_vus");
    }
}
