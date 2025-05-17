<?php

namespace App\Http\Controllers\Api\Log;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Log\Logs;
use App\Models\HocPhan\HocPhanCauHoi;
use Illuminate\Http\Request;

class LogController extends Controller
{
    // /api/logs?with=actors,type.message
    public function index(Request $request)
    {
        $query = Logs::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("created_at")
            ->allowedIncludes(["causer", "actors", "type", "type.message"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    // /api/cau-hois/5/logs?with=actors,type.message
    public function indexByCauHoi(Request $request, $id)
    {
        $cau_hoi = HocPhanCauHoi::findOrFail($id);
        $query = Logs::query()->with(["actors", "type.messages"]);
        $query
            ->whereHas("actors", function ($query) use ($id) {
                $query->whereHasMorph("actor", HocPhanCauHoi::class, function ($query) use ($id) {
                    $query->where("id", $id);
                });
            })
            ->orderBy("updated_at", "desc");
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("created_at")
            ->allowedIncludes(["causer", "actors", "type", "type.message"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
}
