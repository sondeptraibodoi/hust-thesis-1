<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lop_hoc_phans', function (Blueprint $table) {
            if (!Schema::hasColumn('lop_hoc_phans', 'ca_hoc')) {
                $table->string('ca_hoc')->nullable()->after('lich_hoc');
            }
        });

        Schema::table('dang_ky_mon_hocs', function (Blueprint $table) {
            if (!Schema::hasColumn('dang_ky_mon_hocs', 'hoc_ky_id')) {
                $table->foreignId('hoc_ky_id')->nullable()->after('sinh_vien_id')->constrained('hoc_kies')->nullOnDelete();
            }

            if (!Schema::hasColumn('dang_ky_mon_hocs', 'mon_hoc_id')) {
                $table->foreignId('mon_hoc_id')->nullable()->after('hoc_ky_id')->constrained('mon_hocs')->nullOnDelete();
            }
        });

        $this->backfillDangKyHocKyAndMonHoc();

        $this->makeDangKyLopHocPhanNullable();

        Schema::table('dang_ky_mon_hocs', function (Blueprint $table) {
            try {
                $table->unique(['sinh_vien_id', 'hoc_ky_id', 'mon_hoc_id'], 'sinh_vien_hoc_ky_mon_hoc_unique');
            } catch (Throwable $e) {
                // The index may already exist in local databases.
            }
        });
    }

    public function down(): void
    {
        Schema::table('dang_ky_mon_hocs', function (Blueprint $table) {
            try {
                $table->dropUnique('sinh_vien_hoc_ky_mon_hoc_unique');
            } catch (Throwable $e) {
            }

            foreach (['mon_hoc_id', 'hoc_ky_id'] as $column) {
                if (Schema::hasColumn('dang_ky_mon_hocs', $column)) {
                    $table->dropConstrainedForeignId($column);
                }
            }
        });

        Schema::table('lop_hoc_phans', function (Blueprint $table) {
            if (Schema::hasColumn('lop_hoc_phans', 'ca_hoc')) {
                $table->dropColumn('ca_hoc');
            }
        });
    }

    private function makeDangKyLopHocPhanNullable(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE dang_ky_mon_hocs ALTER COLUMN lop_hoc_phan_id DROP NOT NULL');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE dang_ky_mon_hocs MODIFY lop_hoc_phan_id BIGINT UNSIGNED NULL');
            return;
        }

        try {
            Schema::table('dang_ky_mon_hocs', function (Blueprint $table) {
                $table->unsignedBigInteger('lop_hoc_phan_id')->nullable()->change();
            });
        } catch (Throwable $e) {
        }
    }

    private function backfillDangKyHocKyAndMonHoc(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement(
                'UPDATE dang_ky_mon_hocs
                SET hoc_ky_id = lop_hoc_phans.hoc_ky_id,
                    mon_hoc_id = lop_hoc_phans.mon_hoc_id
                FROM lop_hoc_phans
                WHERE dang_ky_mon_hocs.lop_hoc_phan_id = lop_hoc_phans.id
                  AND (dang_ky_mon_hocs.hoc_ky_id IS NULL OR dang_ky_mon_hocs.mon_hoc_id IS NULL)'
            );
            return;
        }

        DB::table('dang_ky_mon_hocs')
            ->join('lop_hoc_phans', 'dang_ky_mon_hocs.lop_hoc_phan_id', '=', 'lop_hoc_phans.id')
            ->where(function ($query) {
                $query->whereNull('dang_ky_mon_hocs.hoc_ky_id')
                    ->orWhereNull('dang_ky_mon_hocs.mon_hoc_id');
            })
            ->update([
                'dang_ky_mon_hocs.hoc_ky_id' => DB::raw('lop_hoc_phans.hoc_ky_id'),
                'dang_ky_mon_hocs.mon_hoc_id' => DB::raw('lop_hoc_phans.mon_hoc_id'),
            ]);
    }
};
