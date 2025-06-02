<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDeThiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('de_thi', function (Blueprint $table) {
            $table->id('de_thi_id');
            $table->string('ten_de', 255);
            $table->float('do_kho_trung_binh')->default(0);
            $table->foreignId('nguoi_tao_id')->constrained('nguoi_dung')->onDelete('cascade');
            $table->text('mo_ta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('de_thi');
    }
}
