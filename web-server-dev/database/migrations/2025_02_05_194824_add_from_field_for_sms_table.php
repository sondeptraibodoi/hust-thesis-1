<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFromFieldForSmsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("pk_sms_banks", function (Blueprint $table) {
            $table->string("from")->nullable()->default("api");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("pk_sms_banks", function (Blueprint $table) {
            $table->dropColumn("from");
        });
    }
}
