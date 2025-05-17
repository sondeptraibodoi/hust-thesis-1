<?php

namespace App\Http\Controllers\Api\MaHocPhan;

use App\Traits\ResponseType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Library\QueryBuilder\QueryBuilder;
use App\Library\QueryBuilder\Filters\AllowedFilter;
use App\Library\QueryBuilder\Filters\Custom\FilterLike;
use App\Models\Lop\MaHocPhan;
use Illuminate\Validation\Rule;

class MaHocPhanController extends Controller
{
    use ResponseType;
    public function index(Request $request)
    {
        $query = MaHocPhan::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedSearch(["ma"])
            ->allowedFilters([AllowedFilter::custom("ma", new FilterLike())])
            ->defaultSorts("ma")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function indexAgGrid(Request $request)
    {
        $query = MaHocPhan::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedSearch(["ma"])
            ->allowedAgGrid([])
            ->allowedFilters([AllowedFilter::custom("ma", new FilterLike())])
            ->defaultSorts("ma")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $request->validate(
            [
                "ma" => ["required", "string", "max:255", "min:1", Rule::unique("ph_ma_hoc_phans")],
            ],
            [],
            [
                "ma" => __("lop.field.ma"),
            ]
        );
        $info = $request->all();
        $mahocphan = MaHocPhan::create($info);
        return $this->responseSuccess($mahocphan);
    }

    public function update(Request $request, $id)
    {
        $request->validate(
            [
                "ma" => ["required", "string", "max:255", "min:1", Rule::unique("ph_ma_hoc_phans")->ignore($id)],
                "is_do_an" => "required|boolean",
                "is_do_an_tot_nghiep" => "required|boolean",
                "is_thuc_tap" => "required|boolean",
            ],
            [],
            [
                "ma" => __("lop.field.ma"),
            ]
        );

        $info = $request->all();
        $mahocphan = MaHocPhan::findOrFail($id);
        $result = $mahocphan->update($info);
        return $this->responseSuccess($result);
    }

    public function destroy($id)
    {
        $mahp = MaHocPhan::findOrFail($id);
        $result = $mahp->delete($mahp);
        return $this->responseSuccess($result);
    }

    public function show(Request $request, $id)
    {
        $query = MaHocPhan::query();
        return response()->json($query->findOrFail($id), 200, []);
    }
}
