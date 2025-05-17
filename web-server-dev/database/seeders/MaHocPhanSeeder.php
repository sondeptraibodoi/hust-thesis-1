<?php

namespace Database\Seeders;

use App\Models\Lop\Lop;
use App\Models\Lop\MaHocPhan;
use Illuminate\Database\Seeder;

class MaHocPhanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $query = Lop::select("ma_hp", "ten_hp")->distinct("ma_hp")->orderBy("ma_hp", "desc")->get();
        foreach ($query as $q) {
            MaHocPhan::updateOrInsert(["ma" => $q->ma_hp], ["ten_hp" => $q->ten_hp]);
        }
    }
}
