<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\LoaiDe;
use Illuminate\Http\Request;

class LoaiThiController extends Controller
{
    public function index(Request $request)
    {
        $query = LoaiDe::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("-id")
            ->allowedSearch(["ten_loai"])
            ->allowedFilters(["ten_loai"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
}
