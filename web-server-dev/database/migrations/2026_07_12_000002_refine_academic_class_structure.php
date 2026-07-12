<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RefineAcademicClassStructure extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('lop_hanh_chinhs')) {
            return;
        }

        if (Schema::hasColumn('lop_hanh_chinhs', 'nien_khoa') && Schema::hasColumn('lop_hanh_chinhs', 'khoa')) {
            DB::table('lop_hanh_chinhs')
                ->whereNotNull('nien_khoa')
                ->update(['khoa' => DB::raw('nien_khoa')]);
        }

        Schema::table('lop_hanh_chinhs', function (Blueprint $table) {
            if (Schema::hasColumn('lop_hanh_chinhs', 'chuong_trinh_dao_tao_id')) {
                $table->dropConstrainedForeignId('chuong_trinh_dao_tao_id');
            }

            foreach (['nien_khoa', 'trang_thai'] as $column) {
                if (Schema::hasColumn('lop_hanh_chinhs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    public function down()
    {
        if (!Schema::hasTable('lop_hanh_chinhs')) {
            return;
        }

        Schema::table('lop_hanh_chinhs', function (Blueprint $table) {
            if (!Schema::hasColumn('lop_hanh_chinhs', 'nien_khoa')) {
                $table->string('nien_khoa')->nullable()->after('nganh');
            }

            if (!Schema::hasColumn('lop_hanh_chinhs', 'chuong_trinh_dao_tao_id')) {
                $table->foreignId('chuong_trinh_dao_tao_id')
                    ->nullable()
                    ->after('nien_khoa')
                    ->constrained('chuong_trinh_dao_taos')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('lop_hanh_chinhs', 'trang_thai')) {
                $table->boolean('trang_thai')->default(true)->after('giao_vien_chu_nhiem_id');
            }
        });
    }
}
