<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("l_logs", function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId("log_type_id")->constrained("l_log_types")->onDelete("cascade");
            $table->foreignId("causer_by_id")->constrained("users")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("l_logs");
    }
}
