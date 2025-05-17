<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHpBaiThiCauHoisTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("hp_bai_thi_cau_hois", function (Blueprint $table) {
            $table->id();
            $table->foreignId("bai_thi_id")->constrained("hp_bai_this");
            $table->foreignId("cau_hoi_id")->constrained("hp_cau_hois");
            $table->integer("order")->nullable();
            $table->string("do_kho")->nullable();
            $table->text("noi_dung")->nullable();
            $table->json("lua_chon")->nullable(); // mảng lựa chọn
            $table->json("dap_an")->nullable(); // đáp án là mảng chứa id của lựa chọn phía trên, sinh ngẫu nhiên
            $table->json("ket_qua")->nullable(); // lựa chọn của sinh viên
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
        Schema::dropIfExists("hp_bai_thi_cau_hois");
    }
}
