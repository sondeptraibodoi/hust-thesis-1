<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTlTaiLieusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tl_tai_lieus", function (Blueprint $table) {
            $table->id();
            $table->string("ma")->nullable(false);
            $table->string("ten")->nullable();
            $table->unsignedBigInteger("loai_tai_lieu_id");
            $table->foreign("loai_tai_lieu_id")->references("id")->on("tl_loai_tai_lieus");
            $table->string("trang_thai")->nullable();
            $table->string("loai")->nullable();
            $table->string("pham_vi")->nullable();
            $table->text("noi_dung")->nullable();
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
        Schema::dropIfExists("tl_tai_lieus");
    }
}
