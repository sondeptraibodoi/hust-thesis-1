<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNgayPheDuyetToHpCauHoiPhanBienTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_cau_hoi_phan_bien", function (Blueprint $table) {
            $table->dateTime("ngay_phe_duyet")->nullable();
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
            $table->dropColumn("ngay_phe_duyet");
        });
    }
}
