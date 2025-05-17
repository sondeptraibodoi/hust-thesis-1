<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLLogActorsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("l_log_actors", function (Blueprint $table) {
            $table->id();
            $table->foreignId("log_id")->constrained("l_logs")->onDelete("cascade");
            $table->integer("log_actor_id");
            $table->string("log_actor_type");
            $table->string("subject");
            $table->string("subject_name")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("l_log_actors");
    }
}
