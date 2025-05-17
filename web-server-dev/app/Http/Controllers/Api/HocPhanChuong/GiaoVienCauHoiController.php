<?php
namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\TrangThaiCauHoi;
use App\Enums\TrangThaiPhanBienCauHoi;
use App\Http\Controllers\Controller;
use App\Library\Log\LogHelper;
use App\Library\Log\LogTypeCode;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\HocPhan\HocPhanCauHoiForGiaoVien;
use Illuminate\Http\Request;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanCauHoiPhanBien;
use App\Models\HocPhan\HocPhanChuong;
use DB;

class GiaoVienCauHoiController extends Controller
{
    public function listCauHoiGv(Request $request)
    {
        $user = $request->user();
        $query = HocPhanCauHoiForGiaoVien::query()
            ->orderByRaw(
                "
                CASE
                    WHEN trang_thai = 'can_sua_do_kho' THEN 0
                    WHEN trang_thai = 'can_sua' THEN 1
                    WHEN trang_thai = 'moi_tao' THEN 2
                    ELSE 3
                END
            "
            )
            ->orderBy("updated_at", "desc")
            ->orderBy("id", "desc");
        $query->with([
            "chuongs",
            "cauHoiPhanBien" => function ($q) {
                $q->select(["id", "cau_hoi_id", "trang_thai_cau_hoi", "ly_do"]); // Chọn thêm 'cau_hoi_id' để phù hợp với quan hệ
                $q->orderBy("id", "desc");
            },
            "primaryChuong.chuong",
        ]);
        $query->where("created_by_id", $user->getKey());
        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->allowedPagination();

        $items = $query->get();

        return response()->json(new \App\Http\Resources\Items($items), 200, []);
    }

    public function show(Request $request, $id)
    {
        $query = HocPhanCauHoiForGiaoVien::findOrFail($id);
        $user = $request->user();
        $query = HocPhanCauHoiForGiaoVien::query()
            ->where("id", $id)
            ->where("created_by_id", $user->getKey())
            ->with(["primaryChuong.chuong", "primaryChuong.maHp", "primaryChuong.loaiThi"])
            ->first();
        return $query;
    }
    public function listPhanBien($id)
    {
        $query = HocPhanCauHoiPhanBien::query()->where("cau_hoi_id", $id)->orderBy("id", "desc");
        $query->with(["giaoVien"]);
        return $query->get();
    }

    public function getChuongTheoMaHp(Request $request, $ma_hp)
    {
        $result = HocPhanChuong::where("ma_hoc_phan", $ma_hp)
            ->where("trang_thai", "1-Đang sử dụng")
            ->orderBy("stt", "asc")
            ->orderBy("id", "asc")
            ->get();

        return response()->json($result->values()->all(), 200);
    }

    public function gvThemCauHoi(Request $request)
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

        return DB::transaction(function () use ($request) {
            $data = $request->all();
            $user = $request->user();
            $user_id = $request->user()->id;

            $loai = count($data["dap_an"]) === 1 ? "single" : "multi";

            $cauHoi = HocPhanCauHoiForGiaoVien::create([
                "noi_dung" => $data["noi_dung"],
                "loai" => $loai,
                "lua_chon" => $data["lua_chon"],
                "loi_giai" => $data["loi_giai"] ?? "",
                "dap_an" => $data["dap_an"],
                "is_machine" => $data["is_machine"] ?? false,
                "created_by_id" => $user_id,
                "trang_thai" => "moi_tao",
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
            $log = LogHelper::fromType(LogTypeCode::CAUHOI_CREATE);
            $log->causerBy($user);
            $log->withActor($giao_vien, "created_by", $giao_vien->getCauserDisplay());
            $log->withActor($cauHoi, "cau_hoi");
            $log = $log->save();
            return $this->responseCreated();
        });
    }

    public function gvThemNhieuCauHoi(Request $request)
    {
        $request->validate([
            "chuongs" => "required|array",
            "chuongs.*.ma_hoc_phan" => "required|string",
            "chuongs.*.do_kho" => "required|string",
            "chuongs.*.chuong_id" => "required",
            "cau_hois" => "required|array",
            "cau_hois.*.noi_dung" => "required|string",
            "cau_hois.*.lua_chon" => "required|array",
            "cau_hois.*.dap_an" => "required|array",
            "cau_hois.*.loai" => "required|string",
        ]);
        return DB::transaction(function () use ($request) {
            $data = $request->all();
            $user = $request->user();
            $user_id = $request->user()->id;

            foreach ($data["cau_hois"] as $cauHoiData) {
                $loai = count($cauHoiData["dap_an"]) === 1 ? "single" : "multi";

                $cauHoi = HocPhanCauHoiForGiaoVien::create([
                    "noi_dung" => $cauHoiData["noi_dung"],
                    "loai" => $loai,
                    "lua_chon" => $cauHoiData["lua_chon"],
                    "dap_an" => $cauHoiData["dap_an"],
                    "created_by_id" => $user_id,
                    "trang_thai" => "moi_tao",
                    "is_machine" => $data["is_machine"] ?? false,
                    "loi_giai" => $cauHoiData["loi_giai"] ?? "",
                ]);

                $chuongs = array_map(function ($item) use ($cauHoi, $cauHoiData) {
                    $do_kho = $item["do_kho"] ?? "easy";
                    if (isset($item["is_primary"]) && $item["is_primary"]) {
                        $do_kho = $cauHoiData["do_kho"] ?? $do_kho;
                    }
                    return new HocPhanCauHoiChuong([
                        "ma_hoc_phan" => $item["ma_hoc_phan"],
                        "chuong_id" => $item["chuong_id"],
                        "do_kho" => $do_kho,
                        "is_primary" => $item["is_primary"] ?? false,
                        "hoc_phan_cau_hoi_id" => $cauHoi->id,
                    ]);
                }, $data["chuongs"]);

                $cauHoi->chuongs()->saveMany($chuongs);

                $giao_vien = $user->info ?? $user;
                $log = LogHelper::fromType(LogTypeCode::CAUHOI_CREATE);
                $log->causerBy($user);
                $log->withActor($giao_vien, "created_by", $giao_vien->getCauserDisplay());
                $log->withActor($cauHoi, "cau_hoi");
                $log = $log->save();
            }

            return $this->responseCreated();
        });
    }

    public function gvUpdateCauHoi(Request $request, $id)
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
            $cauHoi = HocPhanCauHoiForGiaoVien::findOrFail($id);
            $data = $request->all();
            $user = $request->user();
            HocPhanCauHoiChuong::where("cau_hoi_id", $id)->delete();
            $trang_thai = $request->input("trang_thai");
            if ($trang_thai === "can_sua_do_kho") {
                $trang_thai = TrangThaiCauHoi::PheDuyetDoKho;
            }
            $cauHoi->update([
                "noi_dung" => $request->input("noi_dung"),
                "loai" => count($request->input("dap_an")) === 1 ? "single" : "multi",
                "lua_chon" => $request->input("lua_chon"),
                "dap_an" => $request->input("dap_an"),
                "loi_giai" => $data["loi_giai"] ?? "",
                "trang_thai" => $trang_thai,
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
            $trang_thai = $request->input("trang_thai");
            if ($trang_thai === "can_sua_do_kho") {
                $log = LogHelper::fromType(LogTypeCode::CAUHOI_PHEDUYET_SUADOKHO);
            } else {
                $log = LogHelper::fromType(LogTypeCode::CAUHOI_UPDATE);
            }
            $log->causerBy($user);
            $log->withActor($giao_vien, "created_by", $giao_vien->getCauserDisplay());
            $log->withActor($cauHoi, "cau_hoi");
            $log = $log->save();
            return $this->responseUpdated();
        });
    }

    public function destroy(Request $request, $id)
    {
        return DB::transaction(function () use ($id, $request) {
            $user = $request->user();
            $cauHoi = HocPhanCauHoiForGiaoVien::where("created_by_id", $user->getKey())->findOrFail($id);
            HocPhanCauHoiChuong::where("cau_hoi_id", $id)->delete();
            $cauHoi->delete();
            return $this->responseDeleted();
        });
    }
    public function yeuCauPheDuyet(Request $request, $id)
    {
        return DB::transaction(function () use ($id, $request) {
            $user = $request->user();
            $cauHoi = HocPhanCauHoiForGiaoVien::where("created_by_id", $user->getKey())
                ->with([
                    "cauHoiPhanBien" => function ($q) {
                        $q->orderBy("id", "desc")->first();
                    },
                ])
                ->findOrFail($id);
            if (!empty($cauHoi->cauHoiPhanBien[0]) && $cauHoi->cauHoiPhanBien[0]["lan"] == "1") {
                $cauHoi->trang_thai = TrangThaiCauHoi::ChoPhanBien;
            } elseif (!empty($cauHoi->cauHoiPhanBien[0]) && $cauHoi->cauHoiPhanBien[0]["lan"] == "2") {
                $cauHoi->trang_thai = TrangThaiCauHoi::ChoPhanBien2;
            } else {
                $cauHoi->trang_thai = TrangThaiCauHoi::ChoPhanBien;
            }
            $cauHoi->save();
            $giao_vien = $user->info ?? $user;
            $log = LogHelper::fromType(LogTypeCode::CAUHOI_YEUCAUPHEDUYET);
            $log->causerBy($user);
            $log->withActor($giao_vien, "created_by", $giao_vien->getCauserDisplay());
            $log->withActor($cauHoi, "cau_hoi");
            $log = $log->save();
            return $this->responseDeleted();
        });
    }

    public function gvPhanBienCauHoi(Request $request)
    {
        $todayDate = date("Y-m-d");
        $user = $request->user();
        $query = HocPhanCauHoiPhanBien::query()
            ->orderByRaw(
                "CASE WHEN trang_thai_cau_hoi = 'cho_duyet' THEN 0 WHEN trang_thai_cau_hoi = 'phe_duyet'  THEN 1 ELSE 2 END"
            )
            ->orderBy("id", "desc");
        $query->with(["cauHoi", "cauHoi.chuongs", "cauHoi.primaryChuong.chuong"]);
        $query->whereHas("cauHoi", function ($query) {
            $query->active();
        });
        $query->where([["giao_vien_id", "=", $user->info->id], ["ngay_han_phan_bien", ">=", $todayDate]]);
        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->allowedPagination();

        $items = $query->get();

        return response()->json(new \App\Http\Resources\Items($items), 200, []);
    }

    public function trangThaiPhanBien(Request $request, $id)
    {
        return DB::transaction(function () use ($id, $request) {
            $user = $request->user();
            $ly_do = $request->input("ly_do");
            $action = $request->input("action");
            $phanBien = HocPhanCauHoiPhanBien::query()->where("cau_hoi_id", $id)->orderBy("id", "desc")->first();
            $gv_phan_bien = $phanBien["giao_vien_id"];
            $gv_id = $user->info_id;
            $cauHoi = HocPhanCauHoiForGiaoVien::find($id);
            if ($gv_id == $gv_phan_bien) {
                if (
                    in_array($cauHoi->trang_thai, [TrangThaiCauHoi::ChoDuyet1, TrangThaiCauHoi::ChoDuyet2]) &&
                    $phanBien->trang_thai_cau_hoi == TrangThaiPhanBienCauHoi::ChoDuyet
                ) {
                    if ($action === "pheDuyet") {
                        if ($cauHoi->trang_thai == TrangThaiCauHoi::ChoDuyet1 && $phanBien["lan"] == 1) {
                            $cauHoi->trang_thai = TrangThaiCauHoi::ChoPhanBien2;
                        } elseif ($cauHoi->trang_thai == TrangThaiCauHoi::ChoDuyet2 && $phanBien["lan"] == 2) {
                            $cauHoi->trang_thai = TrangThaiCauHoi::DangSuDung;
                        } elseif ($cauHoi->trang_thai == TrangThaiCauHoi::CanSua && $phanBien["lan"] == 1) {
                            $cauHoi->trang_thai = TrangThaiCauHoi::ChoPhanBien2;
                        } elseif ($cauHoi->trang_thai == TrangThaiCauHoi::CanSua && $phanBien["lan"] == 2) {
                            $cauHoi->trang_thai = TrangThaiCauHoi::DangSuDung;
                        }
                    } elseif ($action === "tuChoi") {
                        $cauHoi->trang_thai = TrangThaiCauHoi::CanSua;
                    }
                    $cauHoi->save();

                    if ($action === "pheDuyet") {
                        $phanBien->trang_thai_cau_hoi = TrangThaiPhanBienCauHoi::PheDuyet;
                        $phanBien->ngay_phe_duyet = now();
                    } elseif ($action === "tuChoi") {
                        $phanBien->trang_thai_cau_hoi = TrangThaiPhanBienCauHoi::TuChoi;
                        $phanBien->ngay_phe_duyet = now();
                    }
                    $phanBien->ly_do = $ly_do;
                    $phanBien->save();

                    $giao_vien = $user->info ?? $user;
                    if ($action === "pheDuyet") {
                        $log = LogHelper::fromType(LogTypeCode::CAUHOI_PHANBIEN_PHEDUYET);
                    } elseif ($action === "tuChoi") {
                        $log = LogHelper::fromType(LogTypeCode::CAUHOI_PHANBIEN_TUCHOI);
                    }
                    $log->causerBy($user);
                    $log->withActor($giao_vien, "giao_vien_phan_bien", $giao_vien->getCauserDisplay());
                    $log->withActor($cauHoi, "cau_hoi");
                    $log->save();
                    return $this->responseSuccess();
                } else {
                    return response()->json(
                        [
                            "message" => "Trạng thái đã bị thay đổi, vui lòng thử lại.",
                        ],
                        400
                    );
                }
            } else {
                return response()->json(
                    [
                        "message" => "Câu hỏi đã bị thay đổi giáo viên, vui lòng thử lại.",
                    ],
                    400
                );
            }
        });
    }
}
