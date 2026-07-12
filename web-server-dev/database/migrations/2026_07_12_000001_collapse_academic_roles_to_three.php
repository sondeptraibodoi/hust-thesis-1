<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CollapseAcademicRolesToThree extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('nguoi_dungs') || !Schema::hasColumn('nguoi_dungs', 'vai_tro')) {
            return;
        }

        DB::table('nguoi_dungs')
            ->whereIn('vai_tro', ['giao_vien_bo_mon', 'giao_vien_chu_nhiem'])
            ->update(['vai_tro' => 'giang_vien']);

        $this->syncUserRoleConstraint(['admin', 'sinh_vien', 'giang_vien']);
    }

    public function down()
    {
        $this->syncUserRoleConstraint([
            'admin',
            'sinh_vien',
            'giang_vien',
            'giao_vien_bo_mon',
            'giao_vien_chu_nhiem',
        ]);
    }

    private function syncUserRoleConstraint(array $roles): void
    {
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
