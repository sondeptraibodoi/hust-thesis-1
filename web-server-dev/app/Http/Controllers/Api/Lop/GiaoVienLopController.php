<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Lop\Lop;
use Illuminate\Http\Request;

class GiaoVienLopController extends Controller
{
    public function indexAgGird(Request $request)
    {
        $user = $request->user();
        $query = Lop::query()->with("taiLieus")->withCount("hocPhanChuongs");
        if (isset($user->info_id)) {
            $query->whereHas("giaoViens", function ($query) use ($user) {
                $query->where("id", $user->info_id);
            });
        }
        $query = QueryBuilder::for($query, $request)
            ->allowedSearch(["ma", "ma_kem", "ma_hp", "ten_hp", "ki_hoc"])
            ->allowedAgGrid([])
            ->allowedFilters(["ma", "ma_kem", "ma_hp", "ten_hp", "ki_hoc"])
            ->defaultSort("ma")
            ->allowedIncludes(Lop::INCLUDE)
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $query = Lop::query()->with("maHocPhan");
        if (isset($user->info_id)) {
            $query->whereHas("giaoViens", function ($query) use ($user) {
                $query->where("id", $user->info_id);
            });
        }
        $query = QueryBuilder::for($query, $request)->allowedIncludes(Lop::INCLUDE);
        return response()->json($query->findOrFail($id), 200, []);
    }
    public function indexSinhVien(Request $request, $id)
    {
        // $user = $request->user();
        $query = Lop::query()->with("sinhViens");
        // $query->whereHas('giaoViens', function ($query) use ($user) {
        //     $query->where('id', $user->info_id);
        // });
        $lop = $query->find($id);
        return response()->json($lop->sinhViens, 200, []);
    }
    public function getMaHp(Request $request)
    {
        $is_dai_cuong = $request->boolean("is_dai_cuong");
        $ki_hoc = $request->get("ki_hoc");
        $query = Lop::where("ma_hp", "!=", "thi_bu");
        if ($request->has("is_dai_cuong")) {
            $query->where("is_dai_cuong", $is_dai_cuong);
        }
        if ($request->has("ki_hoc")) {
            $query->where("ki_hoc", $ki_hoc);
        }
        return $query->select("ma_hp")->distinct()->orderBy("ma_hp")->get()->pluck("ma_hp");
    }
}
