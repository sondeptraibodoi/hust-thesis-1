<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\GiaoVienLop;
use App\Models\GiaoVienMon;
use Illuminate\Http\Request;

class PhanCongController extends Controller
{
    public function indexMon(Request $request)
    {
        $query = GiaoVienMon::query()->with(['giaoVien', 'monHoc']);
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedFilters(['mon_hoc_id'])
            ->allowedSearch(["email", "ho_ten", 'mssv'])
            ->allowedIncludes(['giaoVien', 'monHoc'])
            ->allowedPagination();
        $data = $query->paginate();
        return response()->json(new \App\Http\Resources\Items($data), 200, []);
    }

    public function indexLop(Request $request)
    {
        $query = GiaoVienLop::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedSearch(["email", "ho_ten", 'mssv'])
            ->allowedIncludes(['giaoVien', 'lopThi'])
            ->allowedPagination();
        $data = $query->paginate();
        return response()->json(new \App\Http\Resources\Items($data), 200, []);
    }

    public function storeMon(Request $request)
    {
        $query = $request->all();
        foreach ($query['giao_vien_id'] as $key => $value) {
            GiaoVienMon::create([
                'giao_vien_id' => $value,
                'mon_hoc_id' => $query['mon_hoc_id']
            ]);
        }
        return $this->responseSuccess();
    }

    public function updateMon(Request $request, $id)
    {
        $query = $request->all();
        $giaoVien = GiaoVienMon::find($id);
        $giaoVien->update([
            'giao_vien_id' => $query['giao_vien_id']
        ]);
        return $this->responseSuccess();
    }

    public function deleteMon($id)
    {
        $giaoVien = GiaoVienMon::find($id);
        $giaoVien->delete();
        return $this->responseSuccess();
    }
}
