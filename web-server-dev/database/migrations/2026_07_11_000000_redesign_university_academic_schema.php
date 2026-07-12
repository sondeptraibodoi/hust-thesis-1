<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RedesignUniversityAcademicSchema extends Migration
{
    public function up()
    {
        if (Schema::hasTable('nguoi_dungs') && Schema::hasColumn('nguoi_dungs', 'vai_tro')) {
            DB::table('nguoi_dungs')
                ->whereIn('vai_tro', ['giao_vien_bo_mon', 'giao_vien_chu_nhiem'])
                ->update(['vai_tro' => 'giang_vien']);
        }

        $this->syncUserRoleConstraint([
            'admin',
            'sinh_vien',
            'giang_vien',
        ]);

        Schema::table('giao_viens', function (Blueprint $table) {
            if (!Schema::hasColumn('giao_viens', 'ma_giao_vien')) {
                $table->string('ma_giao_vien')->nullable()->unique()->after('nguoi_dung_id');
            }

            if (!Schema::hasColumn('giao_viens', 'bo_mon')) {
                $table->string('bo_mon')->nullable()->after('email');
            }

            if (!Schema::hasColumn('giao_viens', 'hoc_vi')) {
                $table->string('hoc_vi')->nullable()->after('bo_mon');
            }
        });

        Schema::table('mon_hocs', function (Blueprint $table) {
            if (!Schema::hasColumn('mon_hocs', 'so_tin_chi')) {
                $table->unsignedTinyInteger('so_tin_chi')->default(3)->after('ma');
            }

            if (!Schema::hasColumn('mon_hocs', 'diem_qua_mon')) {
                $table->decimal('diem_qua_mon', 4, 2)->nullable()->after('so_tin_chi');
            }

            if (!Schema::hasColumn('mon_hocs', 'bat_buoc')) {
                $table->boolean('bat_buoc')->default(true)->after('diem_qua_mon');
            }

            if (!Schema::hasColumn('mon_hocs', 'trang_thai')) {
                $table->string('trang_thai', 32)->default('dang_mo')->after('bat_buoc');
            }
        });

        if (!Schema::hasTable('hoc_kies')) {
            Schema::create('hoc_kies', function (Blueprint $table) {
                $table->id();
                $table->string('ma_hoc_ky')->unique();
                $table->string('ten_hoc_ky');
                $table->string('nam_hoc');
                $table->unsignedTinyInteger('hoc_ky_so');
                $table->date('ngay_bat_dau')->nullable();
                $table->date('ngay_ket_thuc')->nullable();
                $table->boolean('dang_mo_dang_ky')->default(false);
                $table->boolean('dang_mo_phuc_khao')->default(false);
                $table->decimal('diem_qua_mon_mac_dinh', 4, 2)->default(4);
                $table->string('trang_thai', 32)->default('du_kien');
                $table->timestamps();

                $table->unique(['nam_hoc', 'hoc_ky_so']);
            });
        }

        if (!Schema::hasTable('cau_hinh_he_thongs')) {
            Schema::create('cau_hinh_he_thongs', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->json('value')->nullable();
                $table->string('group')->default('academic');
                $table->text('mo_ta')->nullable();
                $table->foreignId('updated_by')->nullable()->constrained('nguoi_dungs')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('chuong_trinh_dao_taos')) {
            Schema::create('chuong_trinh_dao_taos', function (Blueprint $table) {
                $table->id();
                $table->string('ma_chuong_trinh')->unique();
                $table->string('ten_chuong_trinh');
                $table->string('nganh')->nullable();
                $table->string('khoa')->nullable();
                $table->string('nien_khoa')->nullable();
                $table->unsignedSmallInteger('tong_tin_chi')->nullable();
                $table->boolean('trang_thai')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('chuong_trinh_mon_hoc')) {
            Schema::create('chuong_trinh_mon_hoc', function (Blueprint $table) {
                $table->id();
                $table->foreignId('chuong_trinh_dao_tao_id')->constrained('chuong_trinh_dao_taos')->cascadeOnDelete();
                $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->cascadeOnDelete();
                $table->unsignedTinyInteger('hoc_ky_goi_y')->nullable();
                $table->boolean('bat_buoc')->default(true);
                $table->timestamps();

                $table->unique(['chuong_trinh_dao_tao_id', 'mon_hoc_id'], 'ctdt_mon_hoc_unique');
            });
        }

        if (!Schema::hasTable('lop_hanh_chinhs')) {
            Schema::create('lop_hanh_chinhs', function (Blueprint $table) {
                $table->id();
                $table->string('ma_lop')->unique();
                $table->string('ten_lop');
                $table->string('nganh')->nullable();
                $table->string('khoa')->nullable();
                $table->foreignId('giao_vien_chu_nhiem_id')->nullable()->constrained('giao_viens')->nullOnDelete();
                $table->timestamps();
            });
        }

        Schema::table('sinh_viens', function (Blueprint $table) {
            if (!Schema::hasColumn('sinh_viens', 'lop_hanh_chinh_id')) {
                $table->foreignId('lop_hanh_chinh_id')->nullable()->after('nguoi_dung_id')->constrained('lop_hanh_chinhs')->nullOnDelete();
            }

            if (!Schema::hasColumn('sinh_viens', 'chuong_trinh_dao_tao_id')) {
                $table->foreignId('chuong_trinh_dao_tao_id')->nullable()->after('lop_hanh_chinh_id')->constrained('chuong_trinh_dao_taos')->nullOnDelete();
            }

            if (!Schema::hasColumn('sinh_viens', 'trang_thai_hoc_tap')) {
                $table->string('trang_thai_hoc_tap', 32)->default('dang_hoc')->after('ngay_sinh');
            }
        });

        if (!Schema::hasTable('mon_hoc_tien_quyet')) {
            Schema::create('mon_hoc_tien_quyet', function (Blueprint $table) {
                $table->id();
                $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->cascadeOnDelete();
                $table->foreignId('mon_hoc_tien_quyet_id')->constrained('mon_hocs')->cascadeOnDelete();
                $table->string('loai_dieu_kien', 32)->default('bat_buoc');
                $table->timestamps();

                $table->unique(['mon_hoc_id', 'mon_hoc_tien_quyet_id'], 'mon_hoc_tien_quyet_unique');
            });
        }

        if (!Schema::hasTable('lop_hoc_phans')) {
            Schema::create('lop_hoc_phans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('hoc_ky_id')->constrained('hoc_kies')->cascadeOnDelete();
                $table->foreignId('mon_hoc_id')->constrained('mon_hocs')->cascadeOnDelete();
                $table->foreignId('giao_vien_bo_mon_id')->nullable()->constrained('giao_viens')->nullOnDelete();
                $table->string('ma_lop_hoc_phan');
                $table->string('ten_lop_hoc_phan')->nullable();
                $table->unsignedSmallInteger('si_so_toi_da')->nullable();
                $table->string('phong_hoc')->nullable();
                $table->string('lich_hoc')->nullable();
                $table->string('trang_thai', 32)->default('dang_mo');
                $table->timestamps();

                $table->unique(['hoc_ky_id', 'ma_lop_hoc_phan'], 'hoc_ky_lop_hoc_phan_unique');
            });
        }

        if (!Schema::hasTable('dang_ky_mon_hocs')) {
            Schema::create('dang_ky_mon_hocs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('sinh_vien_id')->constrained('sinh_viens')->cascadeOnDelete();
                $table->foreignId('lop_hoc_phan_id')->constrained('lop_hoc_phans')->cascadeOnDelete();
                $table->string('trang_thai', 32)->default('da_dang_ky');
                $table->timestamp('dang_ky_luc')->nullable();
                $table->timestamp('huy_luc')->nullable();
                $table->text('ghi_chu')->nullable();
                $table->timestamps();

                $table->unique(['sinh_vien_id', 'lop_hoc_phan_id'], 'sinh_vien_lop_hoc_phan_unique');
            });
        }

        if (!Schema::hasTable('bang_diems')) {
            Schema::create('bang_diems', function (Blueprint $table) {
                $table->id();
                $table->foreignId('dang_ky_mon_hoc_id')->unique()->constrained('dang_ky_mon_hocs')->cascadeOnDelete();
                $table->foreignId('sinh_vien_id')->constrained('sinh_viens')->cascadeOnDelete();
                $table->foreignId('lop_hoc_phan_id')->constrained('lop_hoc_phans')->cascadeOnDelete();
                $table->decimal('diem_chuyen_can', 4, 2)->nullable();
                $table->decimal('diem_giua_ky', 4, 2)->nullable();
                $table->decimal('diem_cuoi_ky', 4, 2)->nullable();
                $table->decimal('diem_tong_ket', 4, 2)->nullable();
                $table->string('diem_chu', 4)->nullable();
                $table->string('ket_qua', 32)->default('chua_co_diem');
                $table->string('trang_thai', 32)->default('nhap_diem');
                $table->foreignId('nguoi_cham_id')->nullable()->constrained('giao_viens')->nullOnDelete();
                $table->foreignId('nguoi_chot_id')->nullable()->constrained('nguoi_dungs')->nullOnDelete();
                $table->timestamp('ngay_cham')->nullable();
                $table->timestamp('ngay_chot')->nullable();
                $table->text('ghi_chu')->nullable();
                $table->timestamps();

                $table->index(['sinh_vien_id', 'ket_qua']);
                $table->index(['lop_hoc_phan_id', 'trang_thai']);
            });
        }

        if (!Schema::hasTable('lich_su_cham_diems')) {
            Schema::create('lich_su_cham_diems', function (Blueprint $table) {
                $table->id();
                $table->foreignId('bang_diem_id')->constrained('bang_diems')->cascadeOnDelete();
                $table->foreignId('nguoi_cham_id')->nullable()->constrained('giao_viens')->nullOnDelete();
                $table->string('loai_cham', 32)->default('lan_dau');
                $table->json('diem_truoc')->nullable();
                $table->json('diem_sau')->nullable();
                $table->text('ly_do')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('phuc_khaos')) {
            Schema::create('phuc_khaos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('bang_diem_id')->constrained('bang_diems')->cascadeOnDelete();
                $table->foreignId('sinh_vien_id')->constrained('sinh_viens')->cascadeOnDelete();
                $table->foreignId('lop_hoc_phan_id')->constrained('lop_hoc_phans')->cascadeOnDelete();
                $table->string('trang_thai', 32)->default('cho_xu_ly');
                $table->text('noi_dung');
                $table->decimal('diem_cu', 4, 2)->nullable();
                $table->decimal('diem_moi', 4, 2)->nullable();
                $table->foreignId('giao_vien_xu_ly_id')->nullable()->constrained('giao_viens')->nullOnDelete();
                $table->timestamp('ngay_gui')->nullable();
                $table->timestamp('ngay_xu_ly')->nullable();
                $table->text('ket_qua_xu_ly')->nullable();
                $table->timestamps();

                $table->index(['sinh_vien_id', 'trang_thai']);
                $table->index(['lop_hoc_phan_id', 'trang_thai']);
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('phuc_khaos');
        Schema::dropIfExists('lich_su_cham_diems');
        Schema::dropIfExists('bang_diems');
        Schema::dropIfExists('dang_ky_mon_hocs');
        Schema::dropIfExists('lop_hoc_phans');
        Schema::dropIfExists('mon_hoc_tien_quyet');

        Schema::table('sinh_viens', function (Blueprint $table) {
            if (Schema::hasColumn('sinh_viens', 'trang_thai_hoc_tap')) {
                $table->dropColumn('trang_thai_hoc_tap');
            }
            if (Schema::hasColumn('sinh_viens', 'chuong_trinh_dao_tao_id')) {
                $table->dropConstrainedForeignId('chuong_trinh_dao_tao_id');
            }
            if (Schema::hasColumn('sinh_viens', 'lop_hanh_chinh_id')) {
                $table->dropConstrainedForeignId('lop_hanh_chinh_id');
            }
        });

        Schema::dropIfExists('lop_hanh_chinhs');
        Schema::dropIfExists('chuong_trinh_mon_hoc');
        Schema::dropIfExists('chuong_trinh_dao_taos');
        Schema::dropIfExists('cau_hinh_he_thongs');
        Schema::dropIfExists('hoc_kies');

        Schema::table('mon_hocs', function (Blueprint $table) {
            foreach (['trang_thai', 'bat_buoc', 'diem_qua_mon', 'so_tin_chi'] as $column) {
                if (Schema::hasColumn('mon_hocs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('giao_viens', function (Blueprint $table) {
            foreach (['hoc_vi', 'bo_mon', 'ma_giao_vien'] as $column) {
                if (Schema::hasColumn('giao_viens', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        $this->syncUserRoleConstraint(['admin', 'giang_vien', 'sinh_vien']);
    }

    private function syncUserRoleConstraint(array $roles): void
    {
        if (!Schema::hasTable('nguoi_dungs') || !Schema::hasColumn('nguoi_dungs', 'vai_tro')) {
            return;
        }

        $connection = DB::connection()->getDriverName();
        $quotedRoles = collect($roles)->map(fn ($role) => "'{$role}'")->implode(',');

        if ($connection === 'pgsql') {
            DB::statement('ALTER TABLE nguoi_dungs DROP CONSTRAINT IF EXISTS nguoi_dungs_vai_tro_check');
            DB::statement("ALTER TABLE nguoi_dungs ADD CONSTRAINT nguoi_dungs_vai_tro_check CHECK (vai_tro IN ({$quotedRoles}))");
            return;
        }

        if ($connection === 'mysql') {
            DB::statement("ALTER TABLE nguoi_dungs MODIFY vai_tro ENUM({$quotedRoles}) NOT NULL");
        }
    }
}
