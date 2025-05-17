<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpChuongTaiLieusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_chuong_tai_lieus", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("chuong_id");
            $table->foreign("chuong_id")->references("id")->on("hp_chuongs")->onDelete("cascade");
            $table->string("ten");
            $table->string("duong_dan");
            $table->string("so_trang");
            $table->string("duong_dan_xem");
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
        Schema::dropIfExists("hp_chuong_tai_lieus");
    }
}
