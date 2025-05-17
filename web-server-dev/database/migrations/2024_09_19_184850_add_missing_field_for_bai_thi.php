<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMissingFieldForBaiThi extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("hp_bai_thi_cau_hois", function (Blueprint $table) {
            $table->boolean("is_correct")->default(false);
        });
        Schema::table("hp_bai_this", function (Blueprint $table) {
            $table->integer("so_cau_hoi")->default(0);
            $table->integer("diem_toi_da")->default(1);
            $table->foreignId("user_id")->nullable()->constrained("users")->onDelete("set null");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("hp_bai_thi_cau_hois", function (Blueprint $table) {
            $table->dropColumn("is_correct");
        });
        Schema::table("hp_bai_this", function (Blueprint $table) {
            $table->dropColumn("so_cau_hoi");
            $table->dropColumn("diem_toi_da");
            $table->dropColumn("user_id");
        });
    }
}
