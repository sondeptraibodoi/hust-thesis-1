<?php

namespace Database\Seeders;

use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanChuong;
use DB;
use Illuminate\Database\Seeder;
use Storage;

class UpdateHocPhanCauHoiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $chuongs = [
            [
                [
                    "stt" => "1",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "2",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "3",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "4",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "5",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "6",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "7",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "8",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "9",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "10",
                    "ma_hps" => [
                        "MI1131",
                        "MI1131E",
                        "MI1132",
                        "MI1133",
                        "MI1133E",
                        "MI1134",
                        "MI1134E",
                        "MI1130Q",
                        "MI1046",
                    ],
                ],
            ],
            [
                [
                    "stt" => "1",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "1",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
            ],
            [
                [
                    "stt" => "2",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "2",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "1",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "3",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "3",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "2",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "4",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "4",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "3",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "5",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "5",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "4",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "7",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "6",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "5",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "9",
                    "ma_hps" => ["MI1112"],
                ],
                [
                    "stt" => "7",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "8",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "8",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "9",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "9",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            [
                [
                    "stt" => "10",
                    "ma_hps" => ["MI1114", "MI1114E"],
                ],
                [
                    "stt" => "10",
                    "ma_hps" => ["MI1111", "MI1111E", "MI1110Q", "MI1113", "MI1016", "MI1113E"],
                ],
            ],
            // [
            //     [
            //         "stt" => "2",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "4",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "3",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "4",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "5",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "5",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "6",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "6",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "7",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "7",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "8",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "8",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "9",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "9",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
            // [
            //     [
            //         "stt" => "10",
            //         "ma_hps" => ["MI2110", "MI2110Q"],
            //     ],
            //     [
            //         "stt" => "10",
            //         "ma_hps" => ["MI2010", "MI2010Q", "MI2044"],
            //     ],
            // ],
        ];
        DB::transaction(function () use ($chuongs) {
            $res = [];
            foreach ($chuongs as $chuong) {
                $chuongs_converts = $this->convertChuong($chuong);
                $cau_hoi_ids = $this->convertCauHoi($chuongs_converts);
                if (!empty($cau_hoi_ids)) {
                    $res = array_merge($res, $cau_hoi_ids);
                }
            }
            Storage::disk()->put("update-cau-hoi.json", json_encode($res));
        });
    }
    private function convertChuong($chuongs)
    {
        $chuongs_converts = [];
        foreach ($chuongs as $chuong) {
            $ma_hps = $chuong["ma_hps"];
            if (!empty($chuong["chuong_id"])) {
                foreach ($ma_hps as $ma_hp) {
                    $chuongs_converts[] = [
                        "chuong_id" => $chuong["chuong_id"],
                        "ma_hoc_phan" => $ma_hp,
                    ];
                }
            } else {
                $stt = $chuong["stt"];
                foreach ($ma_hps as $ma_hp) {
                    try {
                        $chuong = HocPhanChuong::where("ma_hoc_phan", $ma_hp)->where("stt", $stt)->first();
                        $chuongs_converts[] = [
                            "chuong_id" => $chuong->id,
                            "chuong_ten" => $chuong->ten,
                            "ma_hoc_phan" => $ma_hp,
                        ];
                    } catch (\Throwable $th) {
                        dd($ma_hp, $stt);
                    }
                }
            }
        }
        return $chuongs_converts;
    }
    public function convertCauHoi($chuongs_converts)
    {
        $cau_hoi_ids = [];
        foreach ($chuongs_converts as $chuong_convert) {
            $cauhois = HocPhanCauHoi::whereHas("chuongs", function ($query) use ($chuong_convert) {
                $query->where("ma_hoc_phan", $chuong_convert["ma_hoc_phan"]);
                $query->where("chuong_id", $chuong_convert["chuong_id"]);
                $query->where("is_primary", true);
                $query->orderBy("is_primary", "desc");
            })
                ->with("chuongs")
                ->select("id")
                ->get();
            foreach ($cauhois as $cauhoi) {
                $differences_ma_hp = getDifferenceByChuongButSameMaHocPhan($chuongs_converts, $cauhoi["chuongs"]);
                $differences = getDifferenceByMaHocPhan($chuongs_converts, $cauhoi["chuongs"]);
                if (count($differences_ma_hp) > 0) {
                    foreach ($differences_ma_hp as $diff) {
                        HocPhanCauHoiChuong::where("ma_hoc_phan", $diff["ma_hoc_phan"])
                            ->where("cau_hoi_id", $diff["cau_hoi_id"])
                            ->where("chuong_id", $diff["chuong_id"])
                            ->update(["chuong_id" => $diff["new_chuong_id"]]);
                    }
                }
                $do_kho = $cauhoi["chuongs"][0]["do_kho"];
                if (count($differences) > 0) {
                    foreach ($differences as $diff) {
                        HocPhanCauHoiChuong::create([
                            "ma_hoc_phan" => $diff["ma_hoc_phan"],
                            "cau_hoi_id" => $cauhoi->id,
                            "chuong_id" => $diff["chuong_id"],
                            "do_kho" => $do_kho,
                        ]);
                    }
                }
                if (count($differences) > 0 || count($differences_ma_hp) > 0) {
                    $cau_hoi_ids[] = [
                        "cau_hoi_id" => $cauhoi->id,
                        "diff" => $differences,
                        "diff_ma_hp" => $differences_ma_hp,
                        "do_kho" => $do_kho,
                    ];
                }
            }
        }
        return $cau_hoi_ids;
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

function getDifferenceByMaHocPhan($array1, $array2)
{
    $array2 = $array2->toArray();
    // Bước 1: Tạo danh sách ma_hoc_phan từ array1
    $map_ma_hoc_phan = array_column($array2, "ma_hoc_phan");

    // Bước 2: Lọc các phần tử trong array2 có ma_hoc_phan không nằm trong array1
    $result = array_values(
        array_filter($array1, function ($item) use ($map_ma_hoc_phan) {
            return !in_array($item["ma_hoc_phan"], $map_ma_hoc_phan);
        })
    );

    return $result;
}
function getDifferenceByChuongButSameMaHocPhan($array1, $array2)
{
    $array2 = $array2->toArray();
    // Bước 1: Tạo ánh xạ ma_hoc_phan => chuong_id từ array1
    $map_chuong_id = [];
    foreach ($array1 as $item) {
        $map_chuong_id[$item["ma_hoc_phan"]] = $item["chuong_id"];
    }

    // Bước 2: Lọc các phần tử trong array2 có ma_hoc_phan tồn tại trong array1 nhưng khác chuong_id
    $result = array_values(
        array_filter($array2, function ($item) use ($map_chuong_id) {
            return isset($map_chuong_id[$item["ma_hoc_phan"]]) &&
                $map_chuong_id[$item["ma_hoc_phan"]] !== $item["chuong_id"];
        })
    );
    // Bước 3: Bổ sung trường new_chuong_id
    $result = array_map(function ($item) use ($map_chuong_id) {
        $item["new_chuong_id"] = $map_chuong_id[$item["ma_hoc_phan"]];
        return $item;
    }, $result);
    return $result;
}
