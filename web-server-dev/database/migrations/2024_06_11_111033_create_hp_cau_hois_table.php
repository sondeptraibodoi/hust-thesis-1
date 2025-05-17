<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpCauHoisTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_cau_hois", function (Blueprint $table) {
            $table->id();
            $table->text("noi_dung");
            $table->string("loai");
            $table->json("lua_chon");
            $table->json("dap_an");
            $table->foreignId("created_by_id")->constrained("users");
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
        Schema::dropIfExists("hp_cau_hois");
    }
}
