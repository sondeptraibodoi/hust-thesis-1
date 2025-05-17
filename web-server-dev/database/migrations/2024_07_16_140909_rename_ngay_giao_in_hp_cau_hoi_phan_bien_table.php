<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameNgayGiaoInHpCauHoiPhanBienTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_cau_hoi_phan_bien", function (Blueprint $table) {
            //
            $table->renameColumn("ngay_giao", "ngay_han_phan_bien");
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
            //
            $table->renameColumn("ngay_han_phan_bien", "ngay_giao");
        });
    }
}
