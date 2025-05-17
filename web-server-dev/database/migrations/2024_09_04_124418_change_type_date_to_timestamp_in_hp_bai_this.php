<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeTypeDateToTimestampInHpBaiThis extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_bai_this", function (Blueprint $table) {
            $table->datetime("bat_dau_thi_at")->change();
            $table->datetime("ket_thuc_thi_at")->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_bai_this", function (Blueprint $table) {
            $table->date("bat_dau_thi_at")->change();
            $table->date("ket_thuc_thi_at")->change();
        });
    }
}
