<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSinhVienView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
            CREATE VIEW sinh_vien_view AS
            SELECT ph_lop_sinh_viens.*
            FROM (
                SELECT ph_lops.*
                FROM ph_ma_hoc_phans
                JOIN ph_lops ON ph_ma_hoc_phans.ma = ph_lops.ma_hp
                WHERE ph_ma_hoc_phans.is_thuc_tap = 'true'
            ) AS lop_is_thuc_tap
            JOIN ph_lop_sinh_viens ON lop_is_thuc_tap.id = ph_lop_sinh_viens.lop_id
            LEFT JOIN ph_lop_sinh_vien_do_ans ON ph_lop_sinh_viens.lop_id = ph_lop_sinh_vien_do_ans.lop_id
                AND ph_lop_sinh_viens.sinh_vien_id = ph_lop_sinh_vien_do_ans.sinh_vien_id
            WHERE ph_lop_sinh_vien_do_ans.id IS NULL
            ORDER BY lop_is_thuc_tap.ki_hoc DESC;
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP VIEW IF EXISTS sinh_vien_view;");
    }
}
