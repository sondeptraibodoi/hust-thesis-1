<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLopParentIdToSinhVienExtra extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("ph_lop_sinh_vien_extras", function (Blueprint $table) {
            $table->foreignId("parent_lop_id")->nullable()->constrained("ph_lops")->index();
            $table->dropUnique(["lop_id", "sinh_vien_id", "type"]);
            $table->unique(["lop_id", "sinh_vien_id", "type", "parent_lop_id"]);
        });
        DB::statement("update ph_lop_sinh_vien_extras set parent_lop_id = lop_id");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("ph_lop_sinh_vien_extras", function (Blueprint $table) {
            $table->dropColumn("parent_lop_id");
        });
    }
}
