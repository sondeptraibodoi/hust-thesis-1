<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChiTietBaiLamTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chi_tiet_bai_lam', function (Blueprint $table) {
            $table->foreignId('bai_lam_id')->constrained('bai_lam')->onDelete('cascade');
            $table->foreignId('cau_hoi_id')->constrained('cau_hoi')->onDelete('cascade');
            $table->foreignId('dap_an_id')->constrained('dap_an')->onDelete('cascade');
            $table->boolean('dung_hay_sai')->default(false);
            $table->timestamps();
            $table->primary(['bai_lam_id', 'cau_hoi_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('chi_tiet_bai_lam');
    }
}
