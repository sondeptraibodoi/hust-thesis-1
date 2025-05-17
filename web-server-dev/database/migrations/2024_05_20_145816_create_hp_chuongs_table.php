<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpChuongsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_chuongs", function (Blueprint $table) {
            $table->id();
            $table->string("ma_hoc_phan");
            $table->string("ten");
            $table->text("mo_ta")->nullable();
            $table->string("trang_thai");
            $table->string("tuan_dong");
            $table->string("tuan_mo");
            $table->integer("thoi_gian_thi");
            $table->integer("thoi_gian_doc");
            $table->integer("so_cau_hoi");
            $table->integer("diem_toi_da")->default(1);
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
        Schema::dropIfExists("hp_chuongs");
    }
}
