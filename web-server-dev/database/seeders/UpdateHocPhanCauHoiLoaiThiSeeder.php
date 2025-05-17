<?php

namespace Database\Seeders;

use App\Enums\LoaiBaiThi;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiLoai;
use DB;
use Illuminate\Database\Seeder;

class UpdateHocPhanCauHoiLoaiThiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = DB::select('WITH jobs_refined AS(select (select count (*) FROM (SELECT DISTINCT cau_hoi_id,ma_hoc_phan FROM hp_cau_hoi_chuong   where hp_cau_hoi_chuong.cau_hoi_id = hp_cau_hois.id) temp) as chuong_count,(select count (*) from hp_cau_hoi_loai where hp_cau_hoi_loai.cau_hoi_id = hp_cau_hois.id) as loai_count,id
	from hp_cau_hois )

SELECT *
FROM jobs_refined
WHERE loai_count != chuong_count');
        $result = [];
        foreach ($data as $test) {
            $result[] = $test->id;
        }
        $cau_hois = HocPhanCauHoi::whereIn("id", $result)
            ->with([
                "loaiThi" => function ($query) {
                    $query->where("loai", LoaiBaiThi::THU);
                },
                "chuongs",
            ])
            ->whereHas("loaiThi", function ($query) {
                $query->where("loai", LoaiBaiThi::THU);
            })
            ->get();
        foreach ($cau_hois as $cau_hoi) {
            $differences = $cau_hoi["chuongs"]->toArray();
            HocPhanCauHoiLoai::where("cau_hoi_id", $cau_hoi->getKey())->delete();
            foreach ($differences as $diff) {
                HocPhanCauHoiLoai::updateOrCreate(
                    [
                        "cau_hoi_id" => $cau_hoi->getKey(),
                        "ma_hoc_phan" => $diff["ma_hoc_phan"],
                    ],
                    [
                        "loai" => LoaiBaiThi::THU,
                    ]
                );
            }
            # code...
        }
    }
}

function getDifferenceByChuongId($array1, $array2)
{
    // Create an associative array for quick lookups by chuong_id
    $array2Ids = [];
    foreach ($array2 as $item) {
        $array2Ids[$item["chuong_id"]] = $item;
    }

    // Find differences
    $differences = [];
    foreach ($array1 as $item1) {
        if (!isset($array2Ids[$item1["chuong_id"]])) {
            $differences[] = $item1;
        }
    }

    return $differences;
}
