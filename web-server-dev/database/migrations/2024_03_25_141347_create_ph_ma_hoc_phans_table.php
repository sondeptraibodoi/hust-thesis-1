<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePhMaHocPhansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists("ph_ma_hoc_phans");
        Schema::create("ph_ma_hoc_phans", function (Blueprint $table) {
            $table->id();
            $table->string("ma")->unique();
            $table->string("ten_hp")->nullable();
            $table->boolean("is_do_an")->default(false);
            $table->boolean("is_do_an_tot_nghiep")->default(false);
            $table->boolean("is_thuc_tap")->default(false);
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
        Schema::dropIfExists("ph_ma_hoc_phans");
    }
}
