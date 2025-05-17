<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\Filters\AllowedFilter;
use App\Library\QueryBuilder\Filters\Custom\FilterLike;
use App\Library\QueryBuilder\Filters\Custom\FilterRelation;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Lop\Lop;
use App\Models\Lop\SinhVienExtra;
use DB;
use Illuminate\Http\Request;

class SinhVienLopController extends Controller
{
    protected $includes = ["giaoViens", "sinhViens", "lanDiemDanhs", "hocPhanChuongs"];
    public function indexAgGird(Request $request)
    {
        $user = $request->user();
        $query = Lop::query()->withCount("hocPhanChuongs");
        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $query->whereHas("sinhViens", function ($query) use ($user) {
            $query->where("id", $user->info_id);
        });
        $query->withCount("hocPhanChuongs");
        $query = QueryBuilder::for($query, $request)
            ->allowedSearch(["ma", "ma_kem", "ma_hp", "ten_hp", "ki_hoc"])
            ->allowedAgGrid([])
            ->allowedFilters([
                AllowedFilter::custom("ph_lop_giao_viens", new FilterRelation("giaoViens", "id")),
                AllowedFilter::custom("ma_kem", new FilterLike()),
                AllowedFilter::custom("ma_hp", new FilterLike()),
                AllowedFilter::custom("ten_hp", new FilterLike()),
                AllowedFilter::custom("ma", new FilterLike()),
                "ki_hoc",
            ])
            ->defaultSort("ma")
            ->allowedIncludes($this->includes)
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function show(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $sinh_vien_id = $user->info_id;
        $query = Lop::query()->with([
            "giaoViens",
            "lanDiemDanhs",
            "maHocPhan",
            "lanDiemDanhs.diemDanhs" => function ($query) use ($sinh_vien_id) {
                $query->where("sinh_vien_id", $sinh_vien_id);
            },
            "sinhViens" => function ($query) use ($sinh_vien_id) {
                $query->where("sinh_vien_id", $sinh_vien_id);
            },
            "lopSinhVienDoAn" => function ($query) use ($sinh_vien_id) {
                $query->where("sinh_vien_id", $sinh_vien_id);
            },
            "lopSinhVienDoAn.giaoVien" => function ($query) {
                $query->select("id", "name");
            },
            "giaoVienPhanBien" => function ($query) use ($sinh_vien_id) {
                $query->where("sinh_vien_id", $sinh_vien_id);
            },
            "giaoVienPhanBien.giaoVien" => function ($query) {
                $query->select("id", "name");
            },
        ]);
        $query->whereHas("sinhViens", function ($query) use ($sinh_vien_id) {
            $query->where("id", $sinh_vien_id);
        });
        $query = QueryBuilder::for($query, $request)->allowedIncludes($this->includes);

        $result = $query->findOrFail($id);
        $sinhVienExtras = SinhVienExtra::with("parentLop:id,loai,ma")
            ->where("lop_id", $id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->get();
        $result["extra"] = $sinhVienExtras;
        return response()->json($result, 200, []);
    }

    public function diemDanh(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->is_sinh_vien) {
            abort(403);
        }

        $query = DB::table("ph_diem_danhs")
            ->join("ph_lan_diem_danhs", "ph_diem_danhs.lan_diem_danh_id", "=", "ph_lan_diem_danhs.id")
            ->join("ph_lops", "ph_lan_diem_danhs.lop_id", "=", "ph_lops.id")
            ->join("u_sinh_viens", "ph_diem_danhs.sinh_vien_id", "=", "u_sinh_viens.id");

        $query->select([
            "ph_diem_danhs.id",
            DB::raw("ph_lops.ma as ma_lop"),
            "ph_lops.loai",
            "ph_lan_diem_danhs.lan",
            "ph_lan_diem_danhs.ngay_diem_danh",
            "u_sinh_viens.mssv",
            "ph_diem_danhs.co_mat",
            "ph_diem_danhs.ghi_chu",
        ]);
        $query->orderBy("ph_lan_diem_danhs.ngay_diem_danh");
        $query->where("ph_diem_danhs.sinh_vien_id", $user->info_id)->where("ph_diem_danhs.lop_id", $id);

        return response()->json($query->get(), 200, []);
    }
    public function showItem(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $query = Lop::find($id);
        return response()->json($query->findOrFail($id), 200, []);
    }
    public function lopHp(Request $request)
    {
        $user = $request->user();
        $query = Lop::query();
        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $result = $query
            ->whereHas("sinhViens", function ($query) use ($user) {
                $query->where("id", $user->info_id);
            })
            ->get();
        $list_hp = [];
        foreach ($result as $item) {
            $list_hp[] = [
                "lop_id" => $item["id"],
                "ten_hp" => $item["ten_hp"],
                "ma_hp" => $item["ma_hp"],
            ];
        }
        return response()->json(
            [
                "message" => "Thành công",
                "data" => $list_hp,
            ],
            200,
            []
        );
    }

    public function baoCao(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->is_sinh_vien) {
            abort(403);
        }

        $query = DB::table("ph_do_an_bao_caos")->join(
            "u_sinh_viens",
            "ph_do_an_bao_caos.sinh_vien_id",
            "=",
            "u_sinh_viens.id"
        );

        $query->select([
            "ph_do_an_bao_caos.id",
            "ph_do_an_bao_caos.noi_dung_thuc_hien",
            "ph_do_an_bao_caos.noi_dung_da_thuc_hien",
            "ph_do_an_bao_caos.diem_y_thuc",
            "ph_do_an_bao_caos.diem_noi_dung",
            "ph_do_an_bao_caos.lan",
            "ph_do_an_bao_caos.ngay_bao_cao",
            "ph_do_an_bao_caos.ki_hoc",
            "u_sinh_viens.mssv",
            "ph_do_an_bao_caos.ghi_chu",
        ]);
        $query->orderBy("ph_do_an_bao_caos.lan");
        $query->orderBy("ph_do_an_bao_caos.ngay_bao_cao");
        $query->where("ph_do_an_bao_caos.sinh_vien_id", $user->info_id)->where("ph_do_an_bao_caos.lop_id", $id);

        return response()->json($query->get(), 200, []);
    }
}
