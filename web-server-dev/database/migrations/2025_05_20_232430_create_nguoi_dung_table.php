<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNguoiDungTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nguoi_dung', function (Blueprint $table) {
            $table->id('nguoi_dung_id');
            $table->string('ho_ten', 255);
            $table->string('username', 100)->unique();
            $table->string('mat_khau', 255);
            $table->string('email', 255)->unique();
            $table->enum('vai_tro', ['sinh_vien', 'admin', 'super_admin'])->default('sinh_vien');
            $table->enum('trang_thai', ['hoat_dong', 'khoa', 'xoa'])->default('hoat_dong');
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
        Schema::dropIfExists('nguoi_dung');
    }
}
