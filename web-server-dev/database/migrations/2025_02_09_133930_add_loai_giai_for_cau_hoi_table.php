<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLoaiGiaiForCauHoiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_cau_hois", function (Blueprint $table) {
            $table->boolean("is_machine")->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_cau_hois", function (Blueprint $table) {
            $table->dropColumn("is_machine");
        });
    }
}
