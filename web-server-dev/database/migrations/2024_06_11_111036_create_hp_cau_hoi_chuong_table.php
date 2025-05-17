<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpCauHoiChuongTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_cau_hoi_chuong", function (Blueprint $table) {
            $table->string("ma_hoc_phan");
            $table->foreignId("cau_hoi_id")->constrained("hp_cau_hois");
            $table->foreignId("chuong_id")->constrained("hp_chuongs");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("hp_cau_hoi_chuong");
    }
}
