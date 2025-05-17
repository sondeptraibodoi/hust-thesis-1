<?php

namespace App\Http\Controllers\Api\TaiLieu;

use App\Enums\TaiLieuPhamVi;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\TaiLieu\TlLoaiTaiLieu;
use Illuminate\Http\Request;
use App\Models\TaiLieu\TlTaiLieu;
use DB;
use Illuminate\Validation\Rule;

class TaiLieuChungController extends Controller
{
    public function indexQuyDinh(Request $request)
    {
        $query = TlTaiLieu::query()
            ->where("pham_vi", TaiLieuPhamVi::CHUNG)
            ->with([
                "createdBy" => function ($query) {
                    $query->select("id", "username");
                },
                "loaiTaiLieu" => function ($query) {
                    $query->select("id", "ma", "loai");
                },
            ]);

        if ($request->user()->is_sinh_vien) {
            $query->where("show_sinh_vien", true);
        }

        if ($request->user()->is_giao_vien) {
            $query->where("show_giao_vien", true);
        }

        // Thêm logic sắp xếp và lọc
        if ($request->has("sortBy") && $request->has("sortOrder")) {
            $query->orderBy($request->input("sortBy"), $request->input("sortOrder"));
        }

        if ($request->has("search")) {
            $query->where("ten", "like", "%" . $request->input("search") . "%");
        }

        if ($request->has("loai_tai_lieu_id")) {
            $query->where("loai_tai_lieu_id", $request->input("loai_tai_lieu_id"));
        }

        // Phần còn lại của code xử lý phân trang và trả về dữ liệu
        $query = QueryBuilder::for($query, $request)
            ->allowedFilters(["loai_tai_lieu_id", "pham_vi", "trang_thai", "ten"])
            ->allowedSorts(["ten", "loai_tai_lieu_id", "created_at"])
            ->defaultSort("created_at")
            ->allowedAgGrid()
            ->allowedPagination();

        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function taiLieuNhomChung()
    {
        $query = TlLoaiTaiLieu::query()->where("nhom", "Tài liệu chung");

        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function index(Request $request)
    {
        $query = TlTaiLieu::query()
            ->where("pham_vi", TaiLieuPhamVi::CHUNG)
            ->with([
                "createdBy" => function ($query) {
                    $query->select("id", "username");
                },
                "loaiTaiLieu" => function ($query) {
                    $query->select("id", "ma", "loai");
                },
            ]);

        // Thêm logic sắp xếp và lọc
        if ($request->has("sortBy") && $request->has("sortOrder")) {
            $query->orderBy($request->input("sortBy"), $request->input("sortOrder"));
        }

        if ($request->has("search")) {
            $query->where("ten", "like", "%" . $request->input("search") . "%");
        }

        // Phần còn lại của code xử lý phân trang và trả về dữ liệu
        $query = QueryBuilder::for($query, $request)
            ->allowedFilters(["loai_tai_lieu_id", "pham_vi", "trang_thai", "ten"])
            ->allowedSorts(["ten", "loai_tai_lieu_id", "created_at"])
            ->defaultSort("created_at")
            ->allowedAgGrid()
            ->allowedPagination();

        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $request->validate([
            "ma" => ["required", "string", "max:255"],
            "ten" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "link" => ["required", "string"],
        ]);

        $user_id = $request->user()->id;
        $info = $request->all();
        $info["created_by_id"] = $user_id;
        $info["pham_vi"] = TaiLieuPhamVi::CHUNG;
        $result = TlTaiLieu::create($info);
        return $this->responseSuccess($result);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            "ma" => ["required", "string", "max:255"],
            "ten" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "link" => ["required", "string"],
        ]);
        $info = $request->all();
        $tai_lieu = TlTaiLieu::findOrFail($id);
        $tai_lieu->update($info);
        return $this->responseSuccess($tai_lieu);
    }

    public function destroy($id)
    {
        $query = TlTaiLieu::findOrFail($id);
        $query->delete();
        return $this->responseSuccess($query);
    }
}
