<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLanToHpCauHoiPhanBienTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_cau_hoi_phan_bien", function (Blueprint $table) {
            $table->tinyInteger("lan")->default(1)->notNullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_cau_hoi_phan_bien", function (Blueprint $table) {
            $table->dropColumn("lan");
        });
    }
}
