<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTlTaiLieusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tl_tai_lieus", function (Blueprint $table) {
            $table->dropColumn("loai");
            $table->dropColumn("noi_dung");

            $table->text("mo_ta")->nullable()->after("pham_vi");
            $table->text("link")->nullable()->after("mo_ta");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("tl_tai_lieus", function (Blueprint $table) {
            $table->string("loai")->nullable();
            $table->text("noi_dung")->nullable();
            // Xóa cột 'mo_ta' và 'link'
            $table->dropColumn("mo_ta");
            $table->dropColumn("link");
        });
    }
}
