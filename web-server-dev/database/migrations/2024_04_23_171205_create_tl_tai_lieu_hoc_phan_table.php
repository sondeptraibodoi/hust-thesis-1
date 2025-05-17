<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTlTaiLieuHocPhanTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tl_tai_lieu_hoc_phan", function (Blueprint $table) {
            $table->unsignedBigInteger("tai_lieu_id");
            $table->foreign("tai_lieu_id")->references("id")->on("tl_tai_lieus");
            $table->string("ma_hoc_phan");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("tl_tai_lieu_hoc_phan");
    }
}
