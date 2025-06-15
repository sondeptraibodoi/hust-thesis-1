<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('level_mon_hoc', function (Blueprint $table) {
            $table->foreignId('mon_hoc_id')->constrained('mon_hoc')->onDelete('cascade');
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onDelete('cascade');
            $table->integer('level');
            $table->unique(['mon_hoc_id', 'nguoi_dung_id']);
        });

        Schema::table('de_thi', function (Blueprint $table) {
            $table->string('code', 16)->unique();
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
