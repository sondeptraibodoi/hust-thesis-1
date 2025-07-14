<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('loai_this', function (Blueprint $table) {
            $table->id();
            $table->string('ten_loai')->unique();
            $table->integer('thoi_gian_thi')->default(30);
        });

        Schema::table('de_this', function (Blueprint $table) {
            $table->foreignId('loai_thi_id')->constrained('loai_this')->onDelete('cascade');
        });

        Schema::create('chuongs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->onDelete('cascade');
            $table->string('name');
        });

        Schema::create('dap_ans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cau_hoi_id')->constrained('cau_hois')->onDelete('cascade');
            $table->string('name');
            $table->text('context');
        });

        Schema::table('cau_hois', function (Blueprint $table) {
            $table->foreignId('chuong_id')->nullable()->constrained('chuongs')->onDelete('cascade');
            $table->text('chu_thich')->nullable();
            $table->text('image_url')->nullable();
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
