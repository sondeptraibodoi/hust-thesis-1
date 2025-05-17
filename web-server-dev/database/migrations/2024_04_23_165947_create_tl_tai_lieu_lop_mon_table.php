<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTlTaiLieuLopMonTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tl_tai_lieu_lop_mon", function (Blueprint $table) {
            $table->unsignedBigInteger("tai_lieu_id");
            $table->foreign("tai_lieu_id")->references("id")->on("tl_tai_lieus");
            $table->unsignedBigInteger("lop_id");
            $table->foreign("lop_id")->references("id")->on("ph_lops");
            $table->primary(["tai_lieu_id", "lop_id"]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("tl_tai_lieu_lop_mon");
    }
}
