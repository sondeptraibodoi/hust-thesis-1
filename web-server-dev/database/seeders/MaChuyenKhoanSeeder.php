<?php

namespace Database\Seeders;

use App\Models\PhucKhao\MaThanhToan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaChuyenKhoanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        MaThanhToan::truncate();
        $array = [];
        for ($i = 0; $i < 1000000; $i++) {
            $array[] = str_pad($i, 6, "0", STR_PAD_LEFT);
        }
        $suffle_array = $this->shuffleArray($array);

        $ma_thanh_toans = array_map(function ($value) {
            return ["ma" => $value];
        }, $suffle_array);

        while (count($ma_thanh_toans) > 0) {
            $queue = array_splice($ma_thanh_toans, 0, 50000);
            DB::table("pk_ma_thanh_toans")->insert($queue);
        }
    }

    private function shuffleArray($array)
    {
        $count = count($array);
        for ($i = $count - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);

            // Swap elements $i and $j
            $temp = $array[$i];
            $array[$i] = $array[$j];
            $array[$j] = $temp;
        }
        return $array;
    }
}
