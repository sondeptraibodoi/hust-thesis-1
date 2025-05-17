<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMissingFieldForThiBu extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("sv_don_dang_ky_thi_bus", function (Blueprint $table) {
            if (!Schema::hasColumn("sv_don_dang_ky_thi_bus", "phan_hoi")) {
                $table->text("phan_hoi")->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
