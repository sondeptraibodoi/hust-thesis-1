<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpCauHoiLoaiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_cau_hoi_loai", function (Blueprint $table) {
            $table->foreignId("cau_hoi_id")->constrained("hp_cau_hois")->onDelete("cascade");
            $table->string("ma_hoc_phan");
            $table->string("loai")->default("thi_thu");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("hp_cau_hoi_loai");
    }
}
