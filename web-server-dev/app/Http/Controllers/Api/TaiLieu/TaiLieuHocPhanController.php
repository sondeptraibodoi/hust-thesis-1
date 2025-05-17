<?php

namespace App\Http\Controllers\Api\TaiLieu;

use App\Enums\TaiLieuPhamVi;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\TaiLieu\TlLoaiTaiLieu;
use App\Models\TaiLieu\TlTaiLieu;
use App\Models\TaiLieu\TlTaiLieuHocPhan;
use App\Models\Auth\User;
use DB;
use Illuminate\Http\Request;

class TaiLieuHocPhanController extends Controller
{
    public function index(Request $request)
    {
        $query = TlTaiLieu::query()
            ->where("pham_vi", TaiLieuPhamVi::RIENG)
            ->with([
                "createdBy" => function ($query) {
                    $query->select("id", "username");
                },
                "loaiTaiLieu" => function ($query) {
                    $query->select("id", "ma", "loai");
                },
                "hocPhans" => function ($query) {
                    $query->select("tai_lieu_id", "ma_hoc_phan");
                },
            ])
            ->orderBy("created_at", "desc");

        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->allowedSorts("nguoi_tao")
            ->defaultSort("created_at")
            ->allowedPagination();

        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function store(Request $request)
    {
        $request->validate([
            "ten" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "link" => ["required", "string"],
            "ma_hoc_phan" => ["required"],
        ]);
        $user_id = $request->user()->id;
        $info = $request->all();
        $info["created_by_id"] = $user_id;
        $info["pham_vi"] = TaiLieuPhamVi::RIENG;
        $isMa = isset($info["ma"]);
        $loaiTaiLieu = TlLoaiTaiLieu::find($info["loai_tai_lieu_id"]);
        $info["ma"] = $isMa ? $info["ma"] : $loaiTaiLieu["ma"];
        $result = TlTaiLieu::create($info);

        foreach ($request["ma_hoc_phan"] as $mhp) {
            DB::table("tl_tai_lieu_hoc_phan")->insert([
                "ma_hoc_phan" => $mhp,
                "tai_lieu_id" => $result->id,
            ]);
        }
        return $this->responseSuccess($result);
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            "ten" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "link" => ["required", "string"],
            "ma_hoc_phan" => ["required"],
        ]);

        $info = $request->all();
        $isMa = isset($info["ma"]);
        $loaiTaiLieu = TlLoaiTaiLieu::find($info["loai_tai_lieu_id"]);
        $info["ma"] = $isMa ? $info["ma"] : $loaiTaiLieu["ma"];
        $tlTaiLieu = TlTaiLieu::find($id);
        if ($tlTaiLieu) {
            $tlTaiLieu->update($info); // Cập nhật dữ liệu
        }
        TlTaiLieuHocPhan::where("tai_lieu_id", "=", $id)->delete();

        foreach ($request["ma_hoc_phan"] as $mhp) {
            DB::table("tl_tai_lieu_hoc_phan")->insert([
                "ma_hoc_phan" => $mhp,
                "tai_lieu_id" => $id,
            ]);
        }
        return $this->responseSuccess();
    }
    public function delete($id)
    {
        TlTaiLieuHocPhan::where("tai_lieu_id", $id)->delete();
        TlTaiLieu::where("id", $id)->delete();

        return response()->json(["message" => "Xóa tài liệu học phần thành công"], 200);
    }
}
