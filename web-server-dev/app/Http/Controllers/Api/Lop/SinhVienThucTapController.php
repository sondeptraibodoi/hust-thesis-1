<?php

namespace App\Http\Controllers\Api\Lop;

use App\Constants\RoleCode;
use App\Exports\ThucTapExport;
use App\Exports\DoAnExport;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Lop\Lop;
use App\Models\Lop\LopSinhVienDoAn;
use App\Models\Lop\MaHocPhan;
use App\Models\Lop\ThucTap;
use Carbon\Carbon;
use DB;
use Excel;
use Illuminate\Http\Request;
use Spatie\ResponseCache\Facades\ResponseCache;
use Storage;

class SinhVienThucTapController extends Controller
{
    public function IsThucTap(Request $request, $lop_id)
    {
        $user = $request->user();
        $lop = Lop::findOrFail($lop_id);
        $ma_hp = $lop->ma_hp;
        $checkIsThucTap = MaHocPhan::where("ma", $ma_hp)->where("is_thuc_tap", true)->exists();
        return ["is_thuc_tap" => $checkIsThucTap];
    }
    public function SvThucTap(Request $request, $lop_id)
    {
        $user = $request->user();
        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $sinh_vien_id = $user->info_id;

        return ThucTap::where("lop_id", $lop_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->leftjoin("ph_lops", "ph_thuc_tap.lop_id", "=", "ph_lops.id")
            ->select("ph_thuc_tap.*", "ph_lops.ma as ma_lop")
            ->orderBy("trang_thai")
            ->get();
    }
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $request->validate(
            [
                "lop_id" => "required",
                "sinh_vien_id" => "required",
                "ten_cong_ty" => "required",
                "dia_chi" => "nullable",
                "ghi_chu" => "nullable",
            ],
            [
                "ten_cong_ty.required" => "Trường tên công ty không được bỏ trống",
            ]
        );
        $request->all();
        $phieuThucTap = ThucTap::findOrFail($id);
        $phieuThucTap->update([
            "ten_cong_ty" => $request->input("ten_cong_ty"),
            "dia_chi" => $request->input("dia_chi"),
            "ghi_chu" => $request->input("ghi_chu"),
        ]);
        ResponseCache::clear();
        return $this->responseSuccess($phieuThucTap);
    }
    public function delete(Request $request, $id)
    {
        $query = ThucTap::find($id);
        $query->delete();
        ResponseCache::clear();
        return response()->json(["message" => "Xóa phiếu thực tập thành công"], 200);
    }
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $request->validate(
            [
                "lop_id" => "required",
                "sinh_vien_id" => "required",
                "ten_cong_ty" => "required",
                "dia_chi" => "nullable",
                "ghi_chu" => "nullable",
            ],
            [
                "ten_cong_ty.required" => "Trường tên công ty không được bỏ trống",
            ]
        );
        $request->all();
        $data_insert[] = [
            "lop_id" => $request->input("lop_id"),
            "sinh_vien_id" => $request->input("sinh_vien_id"),
            "ten_cong_ty" => $request->input("ten_cong_ty"),
            "dia_chi" => $request->input("dia_chi"),
            "ghi_chu" => $request->input("ghi_chu"),
        ];
        ThucTap::insert($data_insert);
        ResponseCache::clear();
        return response()->json(["message" => "Đã tạo phiếu thực tập thành công"], 201);
    }
    // Tro ly
    public function IsThucTapNoDoAn(Request $request, $lop_id)
    {
        $lop = Lop::findOrFail($lop_id);
        $ma_hp = $lop->ma_hp;
        $checkIsThucTap = MaHocPhan::where("ma", $ma_hp)
            ->where("is_thuc_tap", true)
            ->where("is_do_an", false)
            ->exists();
        return ["is_thuc_tap" => $checkIsThucTap];
    }
    public function listThucTap(Request $request, $lop_id)
    {
        $user = $request->user();
        if ($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT) || $user->allow(RoleCode::TEACHER)) {
            $results = DB::table("ph_lop_sinh_viens")
                ->where("ph_lop_sinh_viens.lop_id", $lop_id)
                ->leftJoin("ph_thuc_tap_unique_view", function ($join) {
                    $join->on("ph_lop_sinh_viens.lop_id", "ph_thuc_tap_unique_view.lop_id");
                    $join->on("ph_lop_sinh_viens.sinh_vien_id", "ph_thuc_tap_unique_view.sinh_vien_id");
                })
                ->leftjoin("u_sinh_viens", "ph_lop_sinh_viens.sinh_vien_id", "=", "u_sinh_viens.id")
                ->leftjoin("ph_lops", "ph_lop_sinh_viens.lop_id", "=", "ph_lops.id");
            $results->select([
                "ph_thuc_tap_unique_view.id",
                "ph_lop_sinh_viens.lop_id",
                "u_sinh_viens.mssv",
                "ph_lop_sinh_viens.sinh_vien_id",
                "ph_thuc_tap_unique_view.ten_cong_ty",
                "ph_thuc_tap_unique_view.dia_chi",
                "ph_thuc_tap_unique_view.ghi_chu",
                "ph_thuc_tap_unique_view.trang_thai",
                "u_sinh_viens.name as sinh_vien",
                "u_sinh_viens.mssv",
                "ph_lops.ki_hoc",
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
            ]);
            $results->orderBy("ph_thuc_tap_unique_view.trang_thai");
            return $results->get();
        }
        abort(403);
    }
    public function listThucTapAdmin(Request $request)
    {
        $user = $request->user();
        if ($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT)) {
            $query = DB::query()->fromSub(function ($query) {
                $query
                    ->from("ph_lop_sinh_vien_thuc_tap_do_an_views")
                    ->leftJoin("ph_thuc_tap_unique_view", function ($join) {
                        $join->on(
                            "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id",
                            "ph_thuc_tap_unique_view.lop_id"
                        );
                        $join->on(
                            "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id",
                            "ph_thuc_tap_unique_view.sinh_vien_id"
                        );
                    })
                    ->join("u_sinh_viens", "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id", "=", "u_sinh_viens.id")
                    ->join("ph_lops", "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id", "=", "ph_lops.id")
                    ->leftJoin(
                        "u_giao_viens",
                        "ph_lop_sinh_vien_thuc_tap_do_an_views.giao_vien_id",
                        "=",
                        "u_giao_viens.id"
                    );

                $query->select([
                    "ph_thuc_tap_unique_view.id",
                    "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id",
                    "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id",
                    "ph_lop_sinh_vien_thuc_tap_do_an_views.giao_vien_id",
                    DB::raw("u_giao_viens.name as giao_vien_hd"), //ten gv
                    DB::raw("u_giao_viens.name is not null as has_giao_vien"), // gv boolean
                    DB::raw("u_sinh_viens.name as sinh_vien"), //ten sv
                    "u_sinh_viens.mssv",
                    "ph_thuc_tap_unique_view.ten_cong_ty",
                    "ph_thuc_tap_unique_view.dia_chi",
                    "ph_thuc_tap_unique_view.ghi_chu",
                    "ph_thuc_tap_unique_view.trang_thai",
                    "ph_lops.ma",
                    "ph_lops.ma_hp",
                    "ph_lops.ten_hp",
                    "ph_lops.ki_hoc",
                ]);
                $query->orderBy("ma");
                $query->orderBy("mssv");
            }, "sv_thuc_tap");
            $query = QueryBuilder::for($query, $request)
                ->allowedAgGrid()
                ->allowedPagination()
                ->defaultSorts("-ki_hoc", "id");
            return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
        }
        abort(403);
    }
    public function listDoAnAdmin(Request $request)
    {
        $user = $request->user();
        if (!($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT))) {
            abort(403);
        }
        $query = DB::query()->fromSub(function ($query) {
            $query
                ->from("ph_lop_sinh_viens")
                ->join("ph_lops", "ph_lop_sinh_viens.lop_id", "=", "ph_lops.id")
                ->join("ph_ma_hoc_phans", "ph_lops.ma_hp", "=", "ph_ma_hoc_phans.ma")
                ->join("u_sinh_viens", "ph_lop_sinh_viens.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lop_sinh_vien_do_ans", function ($join) {
                    $join
                        ->on("ph_lop_sinh_viens.lop_id", "ph_lop_sinh_vien_do_ans.lop_id")
                        ->on("ph_lop_sinh_viens.sinh_vien_id", "ph_lop_sinh_vien_do_ans.sinh_vien_id");
                })
                ->join("u_giao_viens", "ph_lop_sinh_vien_do_ans.giao_vien_id", "=", "u_giao_viens.id")
                ->where("ph_ma_hoc_phans.is_do_an", true)
                ->orWhere("ph_ma_hoc_phans.is_do_an_tot_nghiep", true);
            $query->select([
                "ph_lop_sinh_vien_do_ans.id",
                "ph_lop_sinh_viens.sinh_vien_id",
                "u_sinh_viens.mssv",
                DB::raw("u_sinh_viens.name as sinh_vien"),
                "ph_lop_sinh_viens.lop_id",
                "ph_lop_sinh_vien_do_ans.giao_vien_id",
                "ph_lop_sinh_vien_do_ans.ten_de_tai",
                "ph_lop_sinh_vien_do_ans.noi_dung",
                "ph_lop_sinh_vien_do_ans.cac_moc_quan_trong",
                DB::raw("u_giao_viens.name as giao_vien"), //ten sv
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc",
            ]);
            $query->orderBy("ph_lops.ma");
            $query->orderBy("u_sinh_viens.mssv");
        }, "ph_thuc_tap");

        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function listPhanBienAdmin(Request $request)
    {
        $user = $request->user();
        if (!$user->allow(RoleCode::ASSISTANT)) {
            abort(403);
        }
        $query = DB::query()->fromSub(function ($query) {
            $query
                ->from("ph_lop_sinh_viens")
                ->join("ph_lop_sinh_vien_giao_vien_phan_bien", function ($join) {
                    $join
                        ->on("ph_lop_sinh_vien_giao_vien_phan_bien.lop_id", "ph_lop_sinh_viens.lop_id")
                        ->on("ph_lop_sinh_vien_giao_vien_phan_bien.sinh_vien_id", "ph_lop_sinh_viens.sinh_vien_id");
                })
                ->join("ph_lops", "ph_lop_sinh_viens.lop_id", "=", "ph_lops.id")
                ->join("ph_ma_hoc_phans", "ph_lops.ma_hp", "=", "ph_ma_hoc_phans.ma")
                ->join("u_sinh_viens", "ph_lop_sinh_viens.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lop_sinh_vien_do_ans", function ($join) {
                    $join
                        ->on("ph_lop_sinh_viens.lop_id", "ph_lop_sinh_vien_do_ans.lop_id")
                        ->on("ph_lop_sinh_viens.sinh_vien_id", "ph_lop_sinh_vien_do_ans.sinh_vien_id");
                })
                ->join("u_giao_viens", "ph_lop_sinh_vien_do_ans.giao_vien_id", "=", "u_giao_viens.id")
                ->join("u_giao_viens as pb", "ph_lop_sinh_vien_giao_vien_phan_bien.giao_vien_id", "=", "pb.id")
                ->where("ph_ma_hoc_phans.is_do_an", true)
                ->orWhere("ph_ma_hoc_phans.is_do_an_tot_nghiep", true);
            $query->select([
                "ph_lop_sinh_vien_do_ans.id",
                "ph_lop_sinh_viens.sinh_vien_id",
                "u_sinh_viens.mssv",
                DB::raw("u_sinh_viens.name as sinh_vien"),
                "ph_lop_sinh_viens.lop_id",
                "ph_lop_sinh_vien_do_ans.giao_vien_id",
                "ph_lop_sinh_vien_do_ans.ten_de_tai",
                "ph_lop_sinh_vien_do_ans.noi_dung",
                "ph_lop_sinh_vien_do_ans.cac_moc_quan_trong",
                DB::raw("u_giao_viens.name as giao_vien_hb"), //ten sv
                DB::raw("pb.name as giao_vien_pb"), //ten sv
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc",
            ]);
            $query->orderBy("ph_lops.ma");
            $query->orderBy("u_sinh_viens.mssv");
        }, "ph_thuc_tap");

        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->defaultSorts("ma")->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function updateDoAnAdmin(Request $request, $id)
    {
        $user = $request->user();
        if (!($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT))) {
            abort(403);
        }
        $do_an = LopSinhVienDoAn::findOrFail($id);
        $do_an->update([
            "ten_de_tai" => $request->input("ten_de_tai"),
            "noi_dung" => $request->input("noi_dung"),
            "cac_moc_quan_trong" => $request->input("cac_moc_quan_trong"),
        ]);
        ResponseCache::clear();
        return $this->responseSuccess($do_an);
    }
    public function duyetThucTap(Request $request, $id)
    {
        $user = $request->user();
        $trang_thai = $request->input("trang_thai");
        if ($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT) || $user->allow(RoleCode::TEACHER)) {
            $results = ThucTap::where("id", $id);
            $results->update(["trang_thai" => $trang_thai]);

            return response()->json(["message" => "Xác nhận thực tập thành công"], 200);
        }
        abort(403);
    }

    public function exportThucTap(Request $request)
    {
        $user = $request->user();
        $sub_data = $request->all();
        $ki_hoc = $request->get("ki_hoc");
        $giao_vien_hd = $request->has("giao_vien_hd");

        if ($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT)) {
            $thuc_tap = DB::table("ph_lop_sinh_vien_thuc_tap_do_an_views")
                ->leftJoin("ph_thuc_tap_unique_view", function ($join) {
                    $join->on(
                        "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id",
                        "ph_thuc_tap_unique_view.lop_id"
                    );
                    $join->on(
                        "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id",
                        "ph_thuc_tap_unique_view.sinh_vien_id"
                    );
                })
                ->join("u_sinh_viens", "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lops", "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id", "=", "ph_lops.id")
                ->leftJoin(
                    "u_giao_viens",
                    "ph_lop_sinh_vien_thuc_tap_do_an_views.giao_vien_id",
                    "=",
                    "u_giao_viens.id"
                );
            $thuc_tap->select(
                "ph_thuc_tap_unique_view.id",
                "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id",
                "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id",
                "ph_lop_sinh_vien_thuc_tap_do_an_views.giao_vien_id",
                DB::raw("u_giao_viens.name as giao_vien_hd"), //ten gv
                DB::raw("u_giao_viens.name is not null as has_giao_vien"), // gv boolean
                DB::raw("u_sinh_viens.name as sinh_vien"), //ten sv
                "u_sinh_viens.mssv",
                "ph_thuc_tap_unique_view.ten_cong_ty",
                "ph_thuc_tap_unique_view.dia_chi",
                "ph_thuc_tap_unique_view.ghi_chu",
                DB::raw("
                    CASE ph_thuc_tap_unique_view.trang_thai
                        WHEN '0-moi-gui' THEN 'Mới gửi'
                        WHEN '1-duyet' THEN 'Đã duyệt'
                        WHEN '2-tu-choi' THEN 'Từ chối'
                        ELSE ''
                    END as trang_thai
                "), // trạng thái
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc"
            );
            $thuc_tap->orderBy("ma");
            $thuc_tap->orderBy("mssv");

            if ($ki_hoc) {
                $thuc_tap->where("ph_lops.ki_hoc", $request["ki_hoc"]);
            }

            if ($giao_vien_hd) {
                $request["giao_vien_hd"]
                    ? $thuc_tap->whereNotNull("giao_vien_id")
                    : $thuc_tap->whereNull("giao_vien_id");
            }
            $filename = Carbon::now()->format("Ymdhms") . "thuc_tap.xlsx";
            Excel::store(new ThucTapExport($thuc_tap->get()->toArray(), $sub_data, "thuc_tap"), $filename);
            $fullPath = Storage::disk("local")->path($filename);
            return response()->download($fullPath)->deleteFileAfterSend(true);
        }
        abort(403);
    }
    // Giao vien

    public function listThucTapDoAn(Request $request)
    {
        $user = $request->user();
        $gv_id = $user->info_id;
        if (!$user->allow(RoleCode::TEACHER)) {
            abort(403);
        }
        $query = DB::query()->fromSub(function ($query) use ($gv_id) {
            $query
                ->from("ph_lop_sinh_vien_do_ans")
                ->where("ph_lop_sinh_vien_do_ans.giao_vien_id", $gv_id)
                ->leftjoin("ph_thuc_tap_unique_view", function ($join) use ($gv_id) {
                    $join
                        ->on("ph_thuc_tap_unique_view.sinh_vien_id", "ph_lop_sinh_vien_do_ans.sinh_vien_id")
                        ->on("ph_thuc_tap_unique_view.lop_id", "ph_lop_sinh_vien_do_ans.lop_id");
                })
                ->join("u_sinh_viens", "ph_lop_sinh_vien_do_ans.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lops", "ph_lop_sinh_vien_do_ans.lop_id", "=", "ph_lops.id");
            $query->select([
                "ph_lop_sinh_vien_do_ans.id",
                "ph_lop_sinh_vien_do_ans.lop_id",
                "ph_lop_sinh_vien_do_ans.sinh_vien_id",
                "ph_thuc_tap_unique_view.ten_cong_ty",
                "ph_thuc_tap_unique_view.dia_chi",
                "ph_thuc_tap_unique_view.ghi_chu",
                "ph_thuc_tap_unique_view.trang_thai",
                "ph_lop_sinh_vien_do_ans.ten_de_tai",
                "ph_lop_sinh_vien_do_ans.noi_dung",
                "ph_lop_sinh_vien_do_ans.cac_moc_quan_trong",
                DB::raw("u_sinh_viens.name as sinh_vien"), //ten sv
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc",
                "u_sinh_viens.mssv",
            ]);
            $query->join("ph_ma_hoc_phans", function ($join) {
                $join->on("ph_lops.ma_hp", "=", "ph_ma_hoc_phans.ma")->where("ph_ma_hoc_phans.is_do_an", "=", "true");
            });
            $query->orderBy("ph_lop_sinh_vien_do_ans.id");
        }, "ph_thuc_tap");

        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->allowedSorts(["ki_hoc"])
            ->defaultSorts(["-ki_hoc", "id"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function listThucTapGv(Request $request)
    {
        $user = $request->user();
        $gv_id = $user->info_id;
        if (!$user->allow(RoleCode::TEACHER)) {
            abort(403);
        }
        $query = DB::query()->fromSub(function ($query) use ($gv_id) {
            $query
                ->from("ph_lop_sinh_vien_thuc_tap_do_an_views")
                ->where("ph_lop_sinh_vien_thuc_tap_do_an_views.giao_vien_id", $gv_id)
                ->leftjoin("ph_thuc_tap_unique_view", function ($join) use ($gv_id) {
                    $join
                        ->on(
                            "ph_thuc_tap_unique_view.sinh_vien_id",
                            "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id"
                        )
                        ->on("ph_thuc_tap_unique_view.lop_id", "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id");
                })
                ->join("ph_lop_sinh_vien_do_ans", function ($join) use ($gv_id) {
                    $join
                        ->on(
                            "ph_lop_sinh_vien_do_ans.sinh_vien_id",
                            "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id"
                        )
                        ->on("ph_lop_sinh_vien_do_ans.lop_id", "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_do_an_id");
                })
                ->join("u_sinh_viens", "ph_lop_sinh_vien_thuc_tap_do_an_views.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lops", "ph_lop_sinh_vien_thuc_tap_do_an_views.lop_do_an_id", "=", "ph_lops.id");
            $query->select([
                "ph_thuc_tap_unique_view.id",
                DB::raw("ph_lop_sinh_vien_thuc_tap_do_an_views.lop_do_an_id"),
                DB::raw("ph_lop_sinh_vien_thuc_tap_do_an_views.lop_thuc_tap_id"),
                "ph_lop_sinh_vien_do_ans.sinh_vien_id",
                "ph_thuc_tap_unique_view.ten_cong_ty",
                "ph_thuc_tap_unique_view.dia_chi",
                "ph_thuc_tap_unique_view.ghi_chu",
                "ph_thuc_tap_unique_view.trang_thai",
                "ph_lop_sinh_vien_do_ans.ten_de_tai",
                "ph_lop_sinh_vien_do_ans.noi_dung",
                "ph_lop_sinh_vien_do_ans.cac_moc_quan_trong",
                DB::raw("u_sinh_viens.name as sinh_vien"), //ten sv
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc",
                "u_sinh_viens.mssv",
            ]);
        }, "ph_thuc_tap");
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->allowedSorts(["ki_hoc"])
            ->defaultSort("-ki_hoc")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function listDoAnTotNghiep(Request $request)
    {
        $user = $request->user();
        $gv_id = $user->info_id;
        if ($user->allow(RoleCode::TEACHER)) {
            $query = DB::query()->fromSub(function ($query) use ($gv_id) {
                $query
                    ->from("ph_lop_sinh_vien_do_ans")
                    ->where("ph_lop_sinh_vien_do_ans.giao_vien_id", $gv_id)
                    ->leftjoin("ph_thuc_tap_unique_view", function ($join) {
                        $join
                            ->on("ph_thuc_tap_unique_view.sinh_vien_id", "ph_lop_sinh_vien_do_ans.sinh_vien_id")
                            ->on("ph_thuc_tap_unique_view.lop_id", "ph_lop_sinh_vien_do_ans.lop_id");
                    })
                    ->join("u_sinh_viens", "ph_lop_sinh_vien_do_ans.sinh_vien_id", "=", "u_sinh_viens.id")
                    ->join("ph_lops", "ph_lop_sinh_vien_do_ans.lop_id", "=", "ph_lops.id");
                $query->select([
                    "ph_lop_sinh_vien_do_ans.id",
                    "ph_lop_sinh_vien_do_ans.lop_id",
                    "ph_lop_sinh_vien_do_ans.sinh_vien_id",
                    "ph_thuc_tap_unique_view.ten_cong_ty",
                    "ph_thuc_tap_unique_view.dia_chi",
                    "ph_thuc_tap_unique_view.ghi_chu",
                    "ph_thuc_tap_unique_view.trang_thai",
                    "ph_lop_sinh_vien_do_ans.ten_de_tai",
                    "ph_lop_sinh_vien_do_ans.noi_dung",
                    "ph_lop_sinh_vien_do_ans.cac_moc_quan_trong",
                    DB::raw("u_sinh_viens.name as sinh_vien"), //ten sv
                    "ph_lops.ma",
                    "ph_lops.ma_hp",
                    "ph_lops.ten_hp",
                    "ph_lops.ki_hoc",
                    "u_sinh_viens.mssv",
                ]);
                $query->join("ph_ma_hoc_phans", function ($join) {
                    $join
                        ->on("ph_lops.ma_hp", "=", "ph_ma_hoc_phans.ma")
                        ->where("ph_ma_hoc_phans.is_do_an_tot_nghiep", "=", "true");
                });
                $query->orderBy("ph_lop_sinh_vien_do_ans.id");
            }, "ph_thuc_tap");

            $query = QueryBuilder::for($query, $request)
                ->allowedAgGrid([])
                ->allowedSorts(["ki_hoc"])
                ->defaultSorts(["-ki_hoc", "id"])
                ->allowedPagination();
            return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
        }
        abort(403);
    }
    public function updateDoAn(Request $request, $id)
    {
        $user = $request->user();
        if ($user->allow(RoleCode::TEACHER)) {
            $request->all();
            $phieuThucTap = LopSinhVienDoAn::findOrFail($id);
            $phieuThucTap->update([
                "ten_de_tai" => $request->input("ten_de_tai"),
                "noi_dung" => $request->input("noi_dung"),
                "cac_moc_quan_trong" => $request->input("cac_moc_quan_trong"),
            ]);
            return $this->responseSuccess($phieuThucTap);
        }
        abort(403);
    }
    public function updateDoAnTotNghiep(Request $request, $id)
    {
        $user = $request->user();
        if ($user->allow(RoleCode::TEACHER)) {
            $request->all();
            $phieuThucTap = LopSinhVienDoAn::findOrFail($id);
            $phieuThucTap->update([
                "ten_de_tai" => $request->input("ten_de_tai"),
                "noi_dung" => $request->input("noi_dung"),
                "cac_moc_quan_trong" => $request->input("cac_moc_quan_trong"),
            ]);
            return $this->responseSuccess($phieuThucTap);
        }
        abort(403);
    }

    public function exportDoAn(Request $request)
    {
        $user = $request->user();
        $sub_data = $request->all();
        $ki_hoc = $request->get("ki_hoc");

        if ($user->allow(RoleCode::ADMIN) || $user->allow(RoleCode::ASSISTANT)) {
            $do_an = DB::table("ph_lop_sinh_viens")
                ->join("ph_lops", "ph_lop_sinh_viens.lop_id", "=", "ph_lops.id")
                ->join("ph_ma_hoc_phans", "ph_lops.ma_hp", "=", "ph_ma_hoc_phans.ma")
                ->join("u_sinh_viens", "ph_lop_sinh_viens.sinh_vien_id", "=", "u_sinh_viens.id")
                ->join("ph_lop_sinh_vien_do_ans", function ($join) {
                    $join
                        ->on("ph_lop_sinh_viens.lop_id", "ph_lop_sinh_vien_do_ans.lop_id")
                        ->on("ph_lop_sinh_viens.sinh_vien_id", "ph_lop_sinh_vien_do_ans.sinh_vien_id");
                })
                ->join("u_giao_viens", "ph_lop_sinh_vien_do_ans.giao_vien_id", "=", "u_giao_viens.id")
                ->where("ph_ma_hoc_phans.is_do_an", true)
                ->orWhere("ph_ma_hoc_phans.is_do_an_tot_nghiep", true);
            $do_an->select(
                "ph_lop_sinh_vien_do_ans.id",
                "ph_lop_sinh_viens.sinh_vien_id",
                "u_sinh_viens.mssv",
                DB::raw("u_sinh_viens.name as sinh_vien"),
                "ph_lop_sinh_viens.lop_id",
                "ph_lop_sinh_vien_do_ans.giao_vien_id",
                "ph_lop_sinh_vien_do_ans.ten_de_tai",
                "ph_lop_sinh_vien_do_ans.noi_dung",
                "ph_lop_sinh_vien_do_ans.cac_moc_quan_trong",
                DB::raw("u_giao_viens.name as giao_vien"), //ten sv
                "ph_lops.ma",
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lops.ki_hoc"
            );
            $do_an->orderBy("ph_lops.ma");
            $do_an->orderBy("u_sinh_viens.mssv");

            if ($ki_hoc) {
                $do_an->where("ph_lops.ki_hoc", $request["ki_hoc"]);
            }
            $filename = Carbon::now()->format("Ymdhms") . "do_an.xlsx";
            Excel::store(new DoAnExport($do_an->get()->toArray(), $sub_data, "do_an"), $filename);
            $fullPath = Storage::disk("local")->path($filename);
            return response()->download($fullPath)->deleteFileAfterSend(true);
        }
        abort(403);
    }
}
