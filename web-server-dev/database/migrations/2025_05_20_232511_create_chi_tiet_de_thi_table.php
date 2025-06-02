<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChiTietDeThiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chi_tiet_de_thi', function (Blueprint $table) {
            $table->foreignId('de_thi_id')->constrained('de_thi')->onDelete('cascade');
            $table->foreignId('cau_hoi_id')->constrained('cau_hoi')->onDelete('cascade');
            $table->unsignedTinyInteger('thu_tu')->nullable();
            $table->timestamps();
            $table->primary(['de_thi_id', 'cau_hoi_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('chi_tiet_de_thi');
    }
}
