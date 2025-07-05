<?php
namespace Database\Seeders;

use App\Constants\RoleCode;
use App\Models\Auth\User;
use App\Models\MonHoc;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MonHocSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $mons = [
            [
                "ten_mon_hoc" => "Toán",
            ],
            [
                "ten_mon_hoc" => "Văn",
            ],
            [
                "ten_mon_hoc" => "Anh",
            ],
            [
                "ten_mon_hoc" => "Lý",
            ],
            [
                "ten_mon_hoc" => "Hóa",
            ],
        ];
        foreach ($mons as $mon) {
             MonHoc::create($mon);
        }

    }
}
