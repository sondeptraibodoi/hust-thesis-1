<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\GiaoVien;
use Illuminate\Http\Request;

class GiaoVienController extends Controller
{
    public function index(Request $request)
    {
        $query = GiaoVien::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedSearch(["email", "ho_ten"])
            ->allowedPagination();
        $data = $query->paginate();
        return response()->json(new \App\Http\Resources\Items($data), 200, []);
    }
}
