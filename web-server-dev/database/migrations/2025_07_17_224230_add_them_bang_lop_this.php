<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddThemBangLopThis extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('lop_this', function (Blueprint $table) {
            $table->id();
            $table->string('ten_lop')->unique();
            $table->string('hoc_ky');
            $table->string('nam_hoc'); // ví dụ: "2024-2025"
            $table->foreignId('mon_hoc_id')->constrained('mon_hocs');
            $table->timestamps();
        });

        Schema::create('sinh_vien_lop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lop_thi_id')->constrained('lop_this');
            $table->foreignId('sinh_vien_id')->constrained('sinh_viens'); // assume sinh viên lưu trong bảng users/nguoi_dungs
            $table->timestamps();
            $table->unique(['lop_thi_id', 'sinh_vien_id']);
        });

        Schema::create('giao_vien_mon', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giao_vien_id')->constrained('giao_viens'); // assume giáo viên cũng trong bảng nguoi_dungs
            $table->foreignId('mon_hoc_id')->constrained('mon_hocs');
            $table->unique(['giao_vien_id', 'mon_hoc_id']);
            $table->timestamps();
        });

        Schema::create('giao_vien_lop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giao_vien_id')->constrained('giao_viens');
            $table->foreignId('lop_thi_id')->constrained('lop_this');
            $table->string('vai_tro')->nullable()->default('Phụ trách'); // VD: "Coi thi", "Phụ trách",...
            $table->timestamps();
            $table->unique(['giao_vien_id', 'lop_thi_id']);
        });

        Schema::create('de_thi_lop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lop_thi_id')->constrained('lop_this');
            $table->foreignId('de_thi_id')->constrained('de_this');
            $table->foreignId('loai_thi_id')->constrained('loai_this');
            $table->string('level')->nullable(); // "A", "B", "C" hoặc "Dễ", "TB", "Khó"
            $table->timestamps();
            $table->unique(['de_thi_id', 'lop_thi_id', 'loai_thi_id', 'level']);
        });

        Schema::table('bai_kiem_tra', function (Blueprint $table) {
            $table->foreignId('lop_thi_id')->nullable()->constrained('lop_this')->onDelete('cascade');
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
