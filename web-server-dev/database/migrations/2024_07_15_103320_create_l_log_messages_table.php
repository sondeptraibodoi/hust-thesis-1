<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLLogMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("l_log_messages", function (Blueprint $table) {
            $table->id();
            $table->foreignId("log_type_id")->constrained("l_log_types")->onDelete("cascade");
            $table->text("message")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("l_log_messages");
    }
}
