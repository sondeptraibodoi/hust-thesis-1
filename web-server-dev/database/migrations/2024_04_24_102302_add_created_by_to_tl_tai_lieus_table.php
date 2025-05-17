<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCreatedByToTlTaiLieusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tl_tai_lieus", function (Blueprint $table) {
            $table->unsignedBigInteger("created_by_id")->nullable(false)->after("noi_dung");
            $table->foreign("created_by_id")->references("id")->on("users");
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
            $table->dropForeign(["created_by_id"]);
            $table->dropColumn("created_by_id");
        });
    }
}
