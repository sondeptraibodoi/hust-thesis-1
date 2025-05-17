<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMaxTimeView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
            CREATE VIEW ph_thuc_tap_max_id_view AS
            SELECT MAX(id) AS max_id, sinh_vien_id, lop_id
            FROM ph_thuc_tap
            GROUP BY sinh_vien_id, lop_id;
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS ph_thuc_tap_max_id_view;");
    }
}
