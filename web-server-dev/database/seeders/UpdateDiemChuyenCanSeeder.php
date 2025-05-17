<?php

namespace Database\Seeders;

use App\Helpers\DiemChuyenCanHelper;
use App\Models\Lop\DiemDanhViewCount;
use App\Models\Lop\Lop;
use Illuminate\Database\Seeder;

class UpdateDiemChuyenCanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $query = Lop::where("ki_hoc", "20231")->where("loai", "!=", "LT")->orderBy("id")->with("sinhViens:id");
        $count = $query->count();
        $current_index = 1;
        $query->chunk(50, function ($lops) use ($count, &$current_index) {
            foreach ($lops as $index => $lop) {
                $sync = [];
                foreach ($lop->sinhViens as $key => $sinh_vien) {
                    $diem_chuyen_can = DiemChuyenCanHelper::tinhDiem($lop, $sinh_vien->id, $lop->id);
                    $sync[$sinh_vien->getKey()] = ["diem" => $diem_chuyen_can];
                }
                $lop->sinhViens()->syncWithoutDetaching($sync);
                print "sll sv:" . count($sync) . "\n ";
                $index_show = $current_index + $index;
                print "$index_show/$count update done - lop:" . $lop->ma . "\n ";
            }
            $current_index = $current_index + $index + 1;
        });
    }
}
