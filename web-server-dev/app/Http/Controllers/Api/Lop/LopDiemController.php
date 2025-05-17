<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Lop\LopDiem;
use DB;

class LopDiemController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::query()->fromSub(function ($query) {
            $query
                ->from("ph_lop_sinh_vien_diems")
                ->join("ph_lops", "ph_lop_sinh_vien_diems.lop_id", "=", "ph_lops.id")
                ->join("u_sinh_viens", "ph_lop_sinh_vien_diems.sinh_vien_id", "=", "u_sinh_viens.id");

            $query->select([
                "ph_lop_sinh_vien_diems.*",
                DB::raw("ph_lops.ma as ma_lop"),
                DB::raw("ph_lops.ma_hp as ma_hp"),
                DB::raw("ph_lops.ten_hp as ten_hp"),
                DB::raw("ph_lops.ki_hoc as ki_hoc"),
                DB::raw("u_sinh_viens.mssv as mssv"),
                DB::raw("u_sinh_viens.name as ten_sinh_vien"),
            ]);
            $query->orderBy("ph_lops.ki_hoc", "desc");
            $query->orderBy("ph_lops.ma");
            $query->orderBy("u_sinh_viens.mssv");
        }, "bang_diems");
        $query = QueryBuilder::for($query, $request)
            ->allowedFilters([])
            ->allowedSorts([])
            ->allowedPagination()
            ->allowedAgGrid();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function destroy($id)
    {
        $lop_thi = LopDiem::findOrFail($id);
        $result = $lop_thi->delete($lop_thi);
        return $this->responseDeleted($result);
    }
}
