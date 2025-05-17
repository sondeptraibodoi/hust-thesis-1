<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Constants\RoleCode;
use App\Enums\TrangThaiCauHoi;
use App\Enums\TrangThaiPhanBienCauHoi;
use App\Helpers\AggridHelper;
use App\Http\Controllers\Controller;
use App\Library\Log\LogHelper;
use App\Library\Log\LogTypeCode;
use App\Library\QueryBuilder\QueryBuilder;
use App\Library\QueryBuilder\Sorts\AllowedSort;
use App\Library\QueryBuilder\Sorts\Custom\RawSort;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanCauHoiLoai;
use App\Models\HocPhan\HocPhanCauHoiPhanBien;
use App\Models\HocPhan\HocPhanUser;
use App\Models\User\GiaoVien;
use DB;
use Illuminate\Http\Request;

class TroLyHocPhanCauHoiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $hp_user = DB::table("hp_user")
            ->where("user_id", $user->id)
            ->groupBy("user_id", "ma_hoc_phan")
            ->pluck("ma_hoc_phan");
        $query = HocPhanCauHoiChuong::query()
            ->whereIn("hp_cau_hoi_chuong.ma_hoc_phan", $hp_user)
            ->join("hp_chuongs", "chuong_id", "hp_chuongs.id")
            ->leftjoin("hp_cau_hoi_loai", function ($join) {
                $join->on("hp_cau_hoi_loai.cau_hoi_id", "=", "hp_cau_hoi_chuong.cau_hoi_id");
                $join->on("hp_cau_hoi_loai.ma_hoc_phan", "=", "hp_cau_hoi_chuong.ma_hoc_phan");
            })
            ->select("hp_cau_hoi_chuong.*")
            ->whereHas("cauHoi", function ($q) {
                $q->whereNotIn("trang_thai", [TrangThaiCauHoi::MoiTao, TrangThaiCauHoi::HuyBo]);
            })
            ->with([
                "cauHoi",
                "cauHoi.primaryChuong",
                "cauHoi.createdBy" => function ($q) {
                    $q->select("id", "username", "info_id", "info_type");
                },
                "cauHoi.createdBy.info" => function ($q) {
                    $q->select(["id", "name"]);
                },
                "cauHoi.cauHoiPhanBien" => function ($q) {
                    $q->select(["id", "cau_hoi_id", "giao_vien_id", "ngay_han_phan_bien", "trang_thai_cau_hoi"]); // Chọn thêm 'cau_hoi_id' để phù hợp với quan hệ
                    $q->orderBy("id", "desc");
                },
                "cauHoi.cauHoiPhanBien.giaoVien" => function ($q) {
                    $q->select(["id", "name"]);
                },
                "chuong" => function ($q) {
                    $q->select(["id", "ma_hoc_phan", "ten", "stt"]);
                },
            ]);

        $query->select("hp_cau_hoi_chuong.*", DB::raw("hp_cau_hoi_loai.loai as loai_thi"));

        if ($request->has("created_by_id")) {
            $created_by_ids = $request->get("created_by_id");

            $query->whereHas("cauHoi.createdBy.info", function ($q) use ($created_by_ids) {
                $q->where("id", $created_by_ids);
            });
        }
        if ($request->has("giao_vien_phan_bien")) {
            $giao_vien_phan_bien = $request->get("giao_vien_phan_bien");

            $query->whereHas("cauHoi.cauHoiPhanBien", function ($q) use ($giao_vien_phan_bien) {
                $q->whereHas("giaoVien", function ($query) use ($giao_vien_phan_bien) {
                    $query->where(function ($query) use ($giao_vien_phan_bien) {
                        foreach ($giao_vien_phan_bien as $name) {
                            $query->orWhere("name", "like", "%" . $name . "%");
                        }
                    });
                    $query->whereIn("hp_cau_hoi_phan_bien.id", function ($subQuery) {
                        $subQuery
                            ->select(DB::raw("MAX(id) as id"))
                            ->from("hp_cau_hoi_phan_bien")
                            ->groupBy("cau_hoi_id");
                    });
                });
            });
        }
        if ($request->has("trang_thai_phan_bien")) {
            $trang_thai_phan_bien = $request->get("trang_thai_phan_bien");

            if ($trang_thai_phan_bien == "chua_co") {
                $query->whereDoesntHave("cauHoi.cauHoiPhanBien");
            } else {
                $query->whereHas("cauHoi.cauHoiPhanBien", function ($q) use ($trang_thai_phan_bien) {
                    $q->whereIn("id", function ($subQuery) {
                        $subQuery->select(DB::raw("MAX(id)"))->from("hp_cau_hoi_phan_bien")->groupBy("cau_hoi_id");
                    });
                    $q->where("trang_thai_cau_hoi", "like", "%" . $trang_thai_phan_bien . "%");
                });
            }
        }
        if ($request->has("ngay_han_phan_bien")) {
            $ngay_han_phan_bien = $request->get("ngay_han_phan_bien");
            $query->whereHas("cauHoi.cauHoiPhanBien", function ($q) use ($ngay_han_phan_bien) {
                $q->whereIn("id", function ($subQuery) {
                    $subQuery->select(DB::raw("MAX(id)"))->from("hp_cau_hoi_phan_bien")->groupBy("cau_hoi_id");
                });
                $q->where("ngay_han_phan_bien", $ngay_han_phan_bien);
            });
        }

        $result = QueryBuilder::for($query, $request)
            ->allowedAgGrid(
                [],
                [
                    "is_primary" => function ($query, $descending) {
                        $query->orderByRaw("CASE
                        WHEN is_primary = true THEN 1
                        WHEN is_primary = false THEN 2
                        ELSE 9
                    END {$descending["sort"]}");
                    },
                    "chuong.stt" => function ($query, $descending) {
                        $query->orderBy("hp_chuongs.stt", $descending["sort"]);
                    },
                    "ma_hoc_phan" => function ($query, $descending) {
                        $query->orderBy("hp_chuongs.ma_hoc_phan", $descending["sort"]);
                    },
                ],
                [
                    "is_primary" => function ($filter, $query) {
                        $query->where("is_primary", $filter["type"] == "true");
                    },
                    "ma_hoc_phan" => "hp_cau_hoi_chuong.ma_hoc_phan",
                    "cau_hoi_id" => "hp_cau_hoi_chuong.cau_hoi_id",
                    "loai_thi" => function ($filter, $query) {
                        if ($filter["filter"] === "thi_thu") {
                            $query->where("hp_cau_hoi_loai.loai", "thi_thu");
                        } elseif ($filter["filter"] === "thi_that") {
                            $query->where(function ($query) {
                                $query->whereNull("hp_cau_hoi_loai.loai");
                                $query->orWhere("hp_cau_hoi_loai.loai", "thi_that");
                            });
                        }
                    },
                ]
            )
            ->allowedFields([])
            ->allowedSorts(["ma_hoc_phan", "is_primary"])
            ->allowedFilters(["noi_dung", "do_kho", "trang_thai", "trang_thai_cau_hoi"])
            ->defaultSorts([
                "ma_hoc_phan",
                AllowedSort::custom(
                    "rank",
                    new RawSort(
                        " (SELECT
            CASE
                    WHEN trang_thai = 'cho_phan_bien' THEN 1
                    WHEN trang_thai = 'cho_phan_bien_lan_2' THEN 2
                    WHEN trang_thai = 'phe_duyet_do_kho' THEN 3
                    WHEN trang_thai = 'cho_duyet_lan_1' THEN 4
                    WHEN trang_thai = 'cho_duyet_lan_2' THEN 5
                    WHEN trang_thai = 'can_sua' THEN 6
                    WHEN trang_thai = 'can_sua_do_kho' THEN 7
                    WHEN trang_thai = 'dang_su_dung' THEN 8
                    ELSE 9
                END + CASE WHEN hp_cau_hoi_chuong.is_primary THEN 0
                    ELSE 99 END
        FROM hp_cau_hois
        WHERE hp_cau_hois.id = hp_cau_hoi_chuong.cau_hoi_id
    )
                    "
                    )
                ),
            ])
            ->allowedPagination();

        $hocPhanCauHoiChuong = $result->get();
        // Xử lý điều kiện sau khi nạp dữ liệu
        foreach ($hocPhanCauHoiChuong as $hocPhan) {
            foreach ($hocPhan->cauHoi as $cauHoi) {
                $firstItem = $hocPhan->cauHoi->cauHoiPhanBien->first();

                if (
                    $hocPhan->cauHoi->trang_thai === TrangThaiCauHoi::ChoPhanBien ||
                    $hocPhan->cauHoi->trang_thai === TrangThaiCauHoi::ChoPhanBien2
                ) {
                    // Xóa dữ liệu của cauHoiPhanBien nếu trạng thái là 'cho_phan_bien' || cho_duyet_lan_2
                    $hocPhan->cauHoi->setRelation("cauHoiPhanBien", collect());
                }
            }
        }
        return response()->json(new \App\Http\Resources\Items($hocPhanCauHoiChuong), 200, []);
    }

    public function optionCauHoi(Request $request)
    {
        $user = $request->user();

        $hp_user = DB::table("hp_user")
            ->where("user_id", $user->id)
            ->groupBy("user_id", "ma_hoc_phan")
            ->pluck("ma_hoc_phan");

        $query = HocPhanCauHoiChuong::query()
            ->whereIn("ma_hoc_phan", $hp_user)
            ->whereHas("cauHoi", function ($q) {
                $q->where("trang_thai", [TrangThaiCauHoi::ChoPhanBien]);
            })
            ->where("is_primary", true)
            ->orderBy("ma_hoc_phan")
            ->with(["cauHoi", "cauHoi.createdBy"]);
        return $query->get();
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $info = $request->all();
            $user = $request->user();
            $cau_hois = $info["cau_hoi_id"];
            $giao_vien_id = $info["giao_vien_id"];
            $giao_vien_phan_bien = GiaoVien::findOrFail($giao_vien_id);
            $ngay_han_phan_bien = $info["ngay_han_phan_bien"] ?? null;
            foreach ($cau_hois as $cau_hoi) {
                $hp_cau_hoi = HocPhanCauHoi::findOrFail($cau_hoi);
                if (in_array($hp_cau_hoi->trang_thai, [TrangThaiCauHoi::ChoPhanBien, TrangThaiCauHoi::ChoPhanBien2])) {
                    $data = [
                        "cau_hoi_id" => $cau_hoi,
                        "giao_vien_id" => $giao_vien_id,
                        "trang_thai_cau_hoi" => TrangThaiPhanBienCauHoi::ChoDuyet,
                    ];

                    if ($ngay_han_phan_bien) {
                        $data["ngay_han_phan_bien"] = $ngay_han_phan_bien;
                    }
                    if ($hp_cau_hoi->trang_thai == TrangThaiCauHoi::ChoPhanBien2) {
                        $data["lan"] = 2;
                    }

                    $giao_vien = $user->info ?? $user;
                    $log = LogHelper::fromType(LogTypeCode::CAUHOI_GIAOGIAOVIEN);
                    $log->causerBy($user);
                    $log->withActor($giao_vien, "nguoi_giao", $user->getCauserDisplay());
                    $log->withActor(
                        $giao_vien_phan_bien,
                        "giao_vien_phe_duyet",
                        $giao_vien_phan_bien->getCauserDisplay()
                    );
                    $log->withActor($hp_cau_hoi, "cau_hoi");
                    $log = $log->save();
                    HocPhanCauHoiPhanBien::create($data);

                    if ($hp_cau_hoi->trang_thai === TrangThaiCauHoi::ChoPhanBien) {
                        $hp_cau_hoi->update(["trang_thai" => TrangThaiCauHoi::ChoDuyet1]);
                    } elseif ($hp_cau_hoi->trang_thai === TrangThaiCauHoi::ChoPhanBien2) {
                        $hp_cau_hoi->update(["trang_thai" => TrangThaiCauHoi::ChoDuyet2]);
                    }
                } else {
                    return response()->json(
                        [
                            "message" => "Trạng thái đã bị thay đổi vui lòng thử lại.",
                        ],
                        400
                    );
                }
            }
            return response()->json([
                "message" => "Thêm giáo viên phản biện cho câu hỏi thành công",
            ]);
        });
    }

    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $info = $request->all();
            $user = $request->user();
            $giao_vien = $user->info ?? $user;
            $giao_vien_id = $info["giao_vien_id"];
            $ngay_han_phan_bien = $info["ngay_han_phan_bien"] ?? null;
            $giao_vien_phan_bien = GiaoVien::findOrFail($giao_vien_id);
            $data = [
                "giao_vien_id" => $giao_vien_id,
            ];
            if ($ngay_han_phan_bien) {
                $data["ngay_han_phan_bien"] = $ngay_han_phan_bien;
            }
            $phan_bien = HocPhanCauHoiPhanBien::findOrFail($id);
            $hp_cau_hoi = HocPhanCauHoi::findOrFail($phan_bien->cau_hoi_id);

            if (in_array($hp_cau_hoi->trang_thai, [TrangThaiCauHoi::ChoDuyet1, TrangThaiCauHoi::ChoDuyet2])) {
                $phan_bien->update($data);
                if ($hp_cau_hoi->trang_thai == TrangThaiCauHoi::ChoPhanBien) {
                    $hp_cau_hoi->trang_thai = TrangThaiCauHoi::ChoDuyet1;
                }
                $hp_cau_hoi->save();

                $log = LogHelper::fromType(LogTypeCode::CAUHOI_GIAOGIAOVIEN);
                $log->causerBy($user);
                $log->withActor($giao_vien, "nguoi_giao", $giao_vien->getCauserDisplay());
                $log->withActor($giao_vien_phan_bien, "giao_vien_phe_duyet", $giao_vien_phan_bien->getCauserDisplay());
                $log->withActor($hp_cau_hoi, "cau_hoi");
                $log = $log->save();
                return $this->responseSuccess();
            } else {
                return response()->json(
                    [
                        "message" => "Trạng thái đã bị thay đổi vui lòng thử lại.",
                    ],
                    400
                );
            }
        });
    }

    public function huyCauHoi(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $user = $request->user();
            $is_create = $request->boolean("is_create");
            $cau_hoi = HocPhanCauHoi::findOrFail($id);
            $chuongs = $cau_hoi->chuongs;
            $cau_hoi->trang_thai = TrangThaiCauHoi::HuyBo;
            $cau_hoi->save();
            $log = LogHelper::fromType(LogTypeCode::CAUHOI_HUY);
            $log->causerBy($user);
            $log->withActor($user, "nguoi_huy", $user->getCauserDisplay());
            $log->withActor($cau_hoi, "cau_hoi");
            $log->save();
            if ($is_create) {
                $logs = $cau_hoi->logs;
                $cau_hoi_moi = $cau_hoi->replicate();
                $cau_hoi_moi->trang_thai = TrangThaiCauHoi::CanSua;
                $cau_hoi_moi->save();
                foreach ($chuongs as $item) {
                    unset($item->id);
                    $cau_hoi_moi->chuongs()->create($item->toArray());
                }
                foreach ($logs as $log) {
                    $helper = new LogHelper($log);
                    $helper->withActor($cau_hoi_moi, "cau_hoi", "");
                    $helper->save();
                }
            }
            return $this->responseSuccess();
        });
    }

    public function suaDoKhoCauHoi(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $user = $request->user();
            $cau_hoi = HocPhanCauHoi::findOrFail($id);
            $has_permission = true;
            if ($cau_hoi->trang_thai !== TrangThaiCauHoi::DangSuDung) {
                abort(400, "Câu hỏi không ở trạng thái đang sử dụng.");
            }
            if ($cau_hoi->baiThiCauHois()->exists()) {
                abort(400, "Câu hỏi đã dùng để thi.");
            }
            if ($user->allow(RoleCode::ASSISTANT)) {
                $has_permission = true;
            } elseif ($user->allow(RoleCode::HP_ASSISTANT)) {
                $hp_cauhoi_chuong = HocPhanCauHoiChuong::query()
                    ->where("cau_hoi_id", $id)
                    ->where("is_primary", true)
                    ->first();
                $has_permission = HocPhanUser::query()
                    ->where("user_id", $user->id)
                    ->where("ma_hoc_phan", $hp_cauhoi_chuong->ma_hoc_phan)
                    ->exists();
            }
            if (!$has_permission) {
                abort(400, "Bạn không có quyền cập nhật câu hỏi này.");
            }
            $cau_hoi->trang_thai = TrangThaiCauHoi::SuaDoKho;
            $cau_hoi->save();

            $log = LogHelper::fromType(LogTypeCode::CAUHOI_YEUCAUSUADOKHO);
            $log->causerBy($user);
            $log->withActor($user, "truong_bo_mon", $user->getCauserDisplay());
            $log->withActor($cau_hoi, "cau_hoi");
            $log->save();

            return $this->responseSuccess();
        });
    }
    public function pheDuyetDoKhoCauHoi(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $user = $request->user();
            $yeuCau = $request->input("yeuCau");
            $cau_hoi = HocPhanCauHoi::findOrFail($id);
            $hp_cauhoi_chuong = HocPhanCauHoiChuong::query()
                ->where("cau_hoi_id", $id)
                ->where("is_primary", true)
                ->first();

            $checkPermission = HocPhanUser::query()
                ->where("user_id", $user->id)
                ->where("ma_hoc_phan", $hp_cauhoi_chuong->ma_hoc_phan)
                ->exists();
            if (!$checkPermission || $cau_hoi->trang_thai !== TrangThaiCauHoi::PheDuyetDoKho) {
                return response()->json(
                    [
                        "message" => "Bạn không có quyền cập nhật câu hỏi học phần này.",
                    ],
                    400
                );
            }

            if ($yeuCau == "phe_duyet") {
                $cau_hoi->trang_thai = TrangThaiCauHoi::DangSuDung;
                $log = LogHelper::fromType(LogTypeCode::CAUHOI_CHAPTHUAN_SUADOKHO);
            } else {
                $cau_hoi->trang_thai = TrangThaiCauHoi::SuaDoKho;
                $log = LogHelper::fromType(LogTypeCode::CAUHOI_TUCHOI_SUADOKHO);
            }

            $cau_hoi->save();
            $log->causerBy($user);
            $log->withActor($user, "truong_bo_mon", $user->getCauserDisplay());
            $log->withActor($cau_hoi, "cau_hoi");
            $log->save();

            return $this->responseSuccess();
        });
    }

    public function indexAll(Request $request)
    {
        $query = HocPhanCauHoiChuong::query()
            ->whereHas("cauHoi", function ($q) {
                $q->whereNotIn("trang_thai", [TrangThaiCauHoi::MoiTao, TrangThaiCauHoi::HuyBo]);
            })
            ->join("hp_cau_hois", "cau_hoi_id", "hp_cau_hois.id")
            ->leftjoin("hp_cau_hoi_loai", function ($join) {
                $join->on("hp_cau_hoi_loai.cau_hoi_id", "=", "hp_cau_hoi_chuong.cau_hoi_id");
                $join->on("hp_cau_hoi_loai.ma_hoc_phan", "=", "hp_cau_hoi_chuong.ma_hoc_phan");
            })
            ->with([
                "cauHoi",
                "cauHoi.createdBy" => function ($q) {
                    $q->select("id", "username", "info_id", "info_type");
                },
                "cauHoi.createdBy.info" => function ($q) {
                    $q->select(["id", "name"]);
                },
                "cauHoi.cauHoiPhanBien" => function ($q) {
                    $q->select(["id", "cau_hoi_id", "giao_vien_id", "ngay_han_phan_bien", "trang_thai_cau_hoi"]);
                    $q->orderBy("id", "desc");
                },
                "cauHoi.cauHoiPhanBien.giaoVien" => function ($q) {
                    $q->select(["id", "name"]);
                },
                "chuong" => function ($q) {
                    $q->select(["id", "ten", "mo_ta"]);
                },
            ]);
        $query->select("hp_cau_hoi_chuong.*", DB::raw("hp_cau_hoi_loai.loai as loai_thi"));

        if ($request->has("giao_vien_phan_bien")) {
            $giao_vien_phan_bien = $request->get("giao_vien_phan_bien");

            $query->whereHas("cauHoi.cauHoiPhanBien", function ($q) use ($giao_vien_phan_bien) {
                $q->whereHas("giaoVien", function ($query) use ($giao_vien_phan_bien) {
                    $query->where("id", $giao_vien_phan_bien);
                    $query->whereIn("hp_cau_hoi_phan_bien.id", function ($subQuery) {
                        $subQuery
                            ->select(DB::raw("MAX(id) as id"))
                            ->from("hp_cau_hoi_phan_bien")
                            ->groupBy("cau_hoi_id");
                    });
                });
            });
        }
        if ($request->has("trang_thai_phan_bien")) {
            $trang_thai_phan_bien = $request->get("trang_thai_phan_bien");

            if ($trang_thai_phan_bien == "chua_co") {
                $query->whereDoesntHave("cauHoi.cauHoiPhanBien");
            } else {
                $query->whereHas("cauHoi.cauHoiPhanBien", function ($q) use ($trang_thai_phan_bien) {
                    $q->whereIn("id", function ($subQuery) {
                        $subQuery->select(DB::raw("MAX(id)"))->from("hp_cau_hoi_phan_bien")->groupBy("cau_hoi_id");
                    });
                    $q->where("trang_thai_cau_hoi", "like", "%" . $trang_thai_phan_bien . "%");
                });
            }
        }
        if ($request->has("ngay_han_phan_bien")) {
            $ngay_han_phan_bien = $request->get("ngay_han_phan_bien");
            $query->whereHas("cauHoi.cauHoiPhanBien", function ($q) use ($ngay_han_phan_bien) {
                $q->whereIn("id", function ($subQuery) {
                    $subQuery->select(DB::raw("MAX(id)"))->from("hp_cau_hoi_phan_bien")->groupBy("cau_hoi_id");
                });
                $q->where("ngay_han_phan_bien", $ngay_han_phan_bien);
            });
        }

        if ($request->has("created_by_id")) {
            $created_by_id = $request->get("created_by_id");
            $query->whereHas("cauHoi.createdBy.info", function ($q) use ($created_by_id) {
                $q->where("id", $created_by_id);
            });
        }

        $result = QueryBuilder::for($query, $request)
            ->allowedAgGrid(
                [],
                [
                    "chuong.ten" => function ($query, $descending) {
                        $query->join("hp_chuongs", "chuong_id", "hp_chuongs.id");

                        $query->orderBy("hp_chuongs.ten", $descending["sort"]);
                    },
                    "do_kho" => function ($query, $descending) {
                        $query->orderByRaw("CASE
                        WHEN hp_cau_hoi_chuong.do_kho = 'hard' THEN 1
                        WHEN hp_cau_hoi_chuong.do_kho = 'medium' THEN 2
                        ELSE 9
                    END {$descending["sort"]}");
                    },
                    "is_primary" => function ($query, $descending) {
                        $query->orderByRaw("CASE
                        WHEN hp_cau_hoi_chuong.is_primary = true THEN 1
                        WHEN hp_cau_hoi_chuong.is_primary = false THEN 2
                        ELSE 9
                    END {$descending["sort"]}");
                    },
                ],
                [
                    "is_primary" => function ($filter, $query) {
                        $query->where("is_primary", $filter["type"] == "true");
                    },
                    "ma_hoc_phan" => "hp_cau_hoi_chuong.ma_hoc_phan",
                    "cau_hoi_id" => "hp_cau_hoi_chuong.cau_hoi_id",
                ]
            )
            ->allowedFields([])
            ->allowedSorts(["cau_hoi_id", "ma_hoc_phan"])
            ->allowedFilters(["noi_dung", "do_kho", "trang_thai", "trang_thai_cau_hoi"])
            ->defaultSorts([
                "ma_hoc_phan",
                AllowedSort::custom(
                    "rank",
                    new RawSort(
                        "CASE
                        WHEN hp_cau_hois.trang_thai = 'cho_phan_bien' THEN 1
                        WHEN hp_cau_hois.trang_thai = 'cho_phan_bien_lan_2' THEN 2
                        WHEN hp_cau_hois.trang_thai = 'phe_duyet_do_kho' THEN 3
                        WHEN hp_cau_hois.trang_thai = 'cho_duyet_lan_1' THEN 4
                        WHEN hp_cau_hois.trang_thai = 'cho_duyet_lan_2' THEN 5
                        WHEN hp_cau_hois.trang_thai = 'can_sua' THEN 6
                        WHEN hp_cau_hois.trang_thai = 'can_sua_do_kho' THEN 7
                        WHEN hp_cau_hois.trang_thai = 'dang_su_dung' THEN 8
                        ELSE 9
                    END
                    "
                    )
                ),
            ])
            ->allowedPagination();

        $hocPhanCauHoiChuong = $result->get();
        foreach ($hocPhanCauHoiChuong as $hocPhan) {
            foreach ($hocPhan->cauHoi as $cauHoi) {
                if (
                    $hocPhan->cauHoi->trang_thai === TrangThaiCauHoi::ChoPhanBien ||
                    $hocPhan->cauHoi->trang_thai === TrangThaiCauHoi::ChoPhanBien2
                ) {
                    $hocPhan->cauHoi->setRelation("cauHoiPhanBien", collect());
                }
            }
        }
        return response()->json(new \App\Http\Resources\Items($hocPhanCauHoiChuong), 200, []);
    }

    public function changeStatusTroLy(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $user = $request->user();
            $trang_thai_moi = $request->input("trang_thai");

            $hp_cau_hoi = HocPhanCauHoi::findOrFail($id);
            $trang_thai_cu = $hp_cau_hoi->trang_thai;

            $hp_cau_hoi->trang_thai = $trang_thai_moi;
            $hp_cau_hoi->save();

            $log = LogHelper::fromType(LogTypeCode::CAUHOI_DOITRANGTHAI);
            $log->causerBy($user);
            $log->withActor($user, "created_by", $user->getCauserDisplay());
            $log->withActor($hp_cau_hoi, "cau_hoi");
            $log->setProperties(["trang_thai_cu" => $trang_thai_cu, "trang_thai_moi" => $trang_thai_moi]);
            $log = $log->save();
            return $this->responseSuccess();
        });
    }
    public function ganLoaiThiCauHoi(Request $request)
    {
        $validatedData = $request->validate([
            "cau_hoi_id" => "required|exists:hp_cau_hois,id",
            "loai" => "required|string|in:thi_thu,thi_that",
        ]);

        try {
            $hocPhanCauHoiChuongs = HocPhanCauHoiChuong::where("cau_hoi_id", $validatedData["cau_hoi_id"])->get();

            foreach ($hocPhanCauHoiChuongs as $hocPhanCauHoiChuong) {
                HocPhanCauHoiLoai::updateOrCreate(
                    [
                        "cau_hoi_id" => $validatedData["cau_hoi_id"],
                        "ma_hoc_phan" => $hocPhanCauHoiChuong->ma_hoc_phan,
                    ],
                    [
                        "loai" => $validatedData["loai"],
                    ]
                );
            }

            return $this->responseSuccess();
        } catch (\Exception $e) {
            return $this->responseError();
        }
    }

    public function copy(Request $request, $id)
    {
        $request->validate([
            "noi_dung" => "required|string",
            "lua_chon" => "required|array",
            "dap_an" => "required|array",
            "chuongs" => "required|array",
            "chuongs.*.ma_hoc_phan" => "required|string",
            "chuongs.*.do_kho" => "required|string",
            "chuongs.*.chuong_id" => "required",
        ]);
        return DB::transaction(function () use ($request, $id) {
            $oldCauHoi = HocPhanCauHoi::findOrFail($id);
            $data = $request->all();
            $user = $request->user();
            $loai = count($data["dap_an"]) === 1 ? "single" : "multi";
            $cauHoi = HocPhanCauHoi::create([
                "noi_dung" => $data["noi_dung"],
                "loai" => $loai,
                "lua_chon" => $data["lua_chon"],
                "dap_an" => $data["dap_an"],
                "created_by_id" => $oldCauHoi->created_by_id,
                "trang_thai" => TrangThaiCauHoi::ChoDuyet1,
            ]);
            $chuongs = array_map(function ($item) {
                return new HocPhanCauHoiChuong([
                    "ma_hoc_phan" => $item["ma_hoc_phan"],
                    "chuong_id" => $item["chuong_id"],
                    "do_kho" => $item["do_kho"],
                    "is_primary" => $item["is_primary"] ?? false,
                ]);
            }, $data["chuongs"]);
            $cauHoi->chuongs()->saveMany($chuongs);

            $giao_vien = $user->info ?? $user;
            $log = LogHelper::fromType(LogTypeCode::CAUHOI_COPY);
            $log->causerBy($user);
            $log->withActor($giao_vien, "created_by", $giao_vien->getCauserDisplay());
            $log->withActor($cauHoi, "cau_hoi");
            $log = $log->save();
            return $this->responseUpdated($cauHoi);
        });
    }
}
