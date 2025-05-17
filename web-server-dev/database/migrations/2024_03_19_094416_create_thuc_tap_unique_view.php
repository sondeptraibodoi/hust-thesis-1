<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateThucTapUniqueView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
            CREATE VIEW ph_thuc_tap_unique_view AS
            select ph_thuc_tap.* from ph_thuc_tap_max_id_view join ph_thuc_tap on ph_thuc_tap_max_id_view.max_id = ph_thuc_tap.id
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP VIEW IF EXISTS ph_thuc_tap_unique_view;");
    }
}
