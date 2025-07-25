<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nguoi_dungs', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('mat_khau');
            $table->enum('vai_tro', ['admin', 'giang_vien', 'sinh_vien']);
            $table->boolean('trang_thai')->default(true);
            $table->boolean('first_login')->default(true);
            $table->text('avatar_url')->nullable();
            $table->timestamps();
        });

        Schema::create('sinh_viens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dungs')->onDelete('cascade');
            $table->string('mssv')->unique();
            $table->string('ho_ten');
            $table->string('email')->unique();
            $table->date('ngay_sinh')->nullable();
            $table->timestamps();
        });

        Schema::create('giao_viens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dungs')->onDelete('cascade');
            $table->string('ho_ten');
            $table->string('email')->unique();
            $table->date('ngay_sinh')->nullable();
            $table->timestamps();
        });

        Schema::create('mon_hocs', function (Blueprint $table) {
            $table->id();
            $table->string('ten_mon_hoc')->unique();
            $table->string('ma')->unique();
            $table->timestamps();
        });

        Schema::create('cau_hois', function (Blueprint $table) {
            $table->id();
            $table->text('de_bai');
            $table->string('dap_an');
            $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->onDelete('cascade');
            $table->integer('do_kho')->default(1); // 1: Dễ, 2: Trung bình, 3: Khó
            $table->timestamps();
        });

        Schema::create('de_this', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->onDelete('cascade');
            $table->integer('tong_so_cau_hoi')->default(0); // Tổng số câu hỏi trong bài kiểm tra
            $table->integer('thoi_gian_thi')->default(0); // Thời gian làm bài tính bằng phút
            $table->foreignId('nguoi_tao_id')->constrained('nguoi_dungs')->onDelete('cascade');
            $table->integer('do_kho')->default(0); // độ khó
            $table->integer('diem_dat')->default(0); // Điểm đạt cho bài kiểm tra
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('cau_hoi_de_thi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('de_thi_id')->constrained('de_this')->onDelete('cascade');
            $table->foreignId('cau_hoi_id')->constrained('cau_hois')->onDelete('cascade');
            $table->decimal('diem', 5, 2)->default(0); // Điểm cho câu hỏi này
            $table->text('ghi_chu')->nullable(); // Ghi chú của người dùng về câu hỏi
            $table->timestamps();
        });

        Schema::create('bai_kiem_tra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dungs')->onDelete('cascade');
            $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->onDelete('cascade');
            $table->decimal('diem', 5, 2)->default(0); // Điểm số của bài kiểm tra
            $table->foreignId('de_thi_id')->constrained('de_this')->onDelete('cascade');
            $table->integer('thoi_gian_nop_bai')->default(0); // Thời gian làm bài tính bằng phút
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('cau_hoi_bai_kiem_tra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bai_kiem_tra_id')->constrained('bai_kiem_tra')->onDelete('cascade');
            $table->foreignId('cau_hoi_id')->constrained('cau_hois')->onDelete('cascade');
            $table->boolean('da_tra_loi')->default(false); // Trạng thái đã chọn câu hỏi
            $table->string('cau_tra_loi')->nullable(); // Câu trả lời của người dùng
            $table->boolean('dap_an_dung')->default(false); // Trạng thái đúng hay sai
            $table->integer('diem')->default(0); // Điểm cho câu hỏi này
            $table->text('ghi_chu')->nullable(); // Ghi chú của người dùng về câu hỏi
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
        Schema::dropIfExists('nguoi_dungs');
    }
}
