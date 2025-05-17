<?php

namespace App\Http\Controllers\Api\TaiLieu;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;
use App\Models\TaiLieu\TlLoaiTaiLieu;
use Illuminate\Validation\Rule;

class LoaiTaiLieuController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexAgGrid(Request $request)
    {
        $nhom = $request->input("nhom");
        $query = TlLoaiTaiLieu::query();
        if ($nhom) {
            $query->where("nhom", $nhom);
        }
        $query = QueryBuilder::for($query, $request)
            ->allowedSearch(["ma", "loai"])
            ->allowedAgGrid([])
            ->defaultSort("ma")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $request->validate(
            [
                "ma" => ["required", "string", "max:255"],
                "loai" => ["string", Rule::unique("tl_loai_tai_lieus")],
            ],
            [],
            [
                "ma" => __("loai-tai-lieu.field.ma"),
                "loai" => __("loai-tai-lieu.field.loai"),
            ]
        );

        $loai = $request->all();
        $loai_tai_lieu = TlLoaiTaiLieu::create($loai);
        return $this->responseSuccess($loai_tai_lieu);
    }

    public function update(Request $request, $id)
    {
        $request->validate(
            [
                "ma" => ["required", "string", "max:255"],
                "loai" => ["string", Rule::unique("tl_loai_tai_lieus")->ignore($id)],
            ],
            [],
            [
                "ma" => __("loai-tai-lieu.field.ma"),
                "loai" => __("loai-tai-lieu.field.loai"),
            ]
        );
        $loai = $request->all();
        $loai_tai_lieu = TlLoaiTaiLieu::findOrFail($id);
        $result = $loai_tai_lieu->update($loai);
        return $this->responseSuccess($result);
    }

    public function destroy($id)
    {
        $loai_tai_lieu = TlLoaiTaiLieu::findOrFail($id);
        $result = $loai_tai_lieu->delete();
        return $this->responseSuccess($result);
    }
}
