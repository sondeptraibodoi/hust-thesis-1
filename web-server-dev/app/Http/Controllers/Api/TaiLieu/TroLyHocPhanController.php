<?php

namespace App\Http\Controllers\Api\TaiLieu;

use App\Enums\TaiLieuPhamVi;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TaiLieu\TlTaiLieu;
use App\Models\TaiLieu\TlLoaiTaiLieu;
use App\Models\TaiLieu\TlTaiLieuHocPhan;
use App\Models\Lop\MaHocPhan;
use App\Models\TaiLieu\TlTaiLieuLopMon;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Auth\User;
class TroLyHocPhanController extends Controller
{
    public function index(Request $request)
    {
        $query = TlTaiLieu::query()
            ->where("pham_vi", TaiLieuPhamVi::RIENG)
            ->join("tl_tai_lieu_hoc_phan", "tl_tai_lieus.id", "=", "tl_tai_lieu_hoc_phan.tai_lieu_id")
            ->where("tl_tai_lieu_hoc_phan.ma_hoc_phan", $request->ma_hoc_phan)
            ->with([
                "createdBy" => function ($query) {
                    $query->select("id", "username");
                },
                "loaiTaiLieu" => function ($query) {
                    $query->select("id", "ma", "loai");
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
            "ma" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "ten" => ["required", "string", "max:255"],
            "link" => ["required", "string"],
        ]);

        $user_id = $request->user()->id;
        $info = $request->all();
        $info["created_by_id"] = $user_id;
        $info["pham_vi"] = TaiLieuPhamVi::RIENG;
        $result = TlTaiLieu::create($info);
        $result->taiLieuHocPhans()->sync($request->ma_hoc_phan);
        return $this->responseSuccess($result);
    }

    public function update(Request $request)
    {
        $request->validate([
            "ma" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "ten" => ["required", "string", "max:255"],
            "link" => ["required", "string"],
        ]);
        $info = $request->all();
        $tai_lieu = TlTaiLieu::findOrFail($request->id);
        $tai_lieu->update($info);
        $tai_lieu->taiLieuHocPhans()->sync($request->ma_hoc_phan);
        return $this->responseSuccess($tai_lieu);
    }

    public function copy(Request $request, $hp_Id)
    {
        $maHocPhan = MaHocPhan::query()->where("id", $hp_Id)->get();
        $taiLieuHocPhan = TlTaiLieuHocPhan::query()
            ->where("ma_hoc_phan", $maHocPhan[0]->ma)
            ->get();
        $taiLieuIds = $taiLieuHocPhan->pluck("tai_lieu_id")->toArray();
        foreach ($taiLieuIds as $taiLieuId) {
            $taiLieu = TlTaiLieuHocPhan::query()
                ->where("ma_hoc_phan", $request->ma_hoc_phan)
                ->where("tai_lieu_id", $taiLieuId)
                ->get();
            if (count($taiLieu) == 0) {
                TlTaiLieuHocPhan::create([
                    "tai_lieu_id" => $taiLieuId,
                    "ma_hoc_phan" => $request->ma_hoc_phan,
                ]);
            }
        }
        return $this->responseSuccess("Thêm tài liệu thành công");
    }

    public function delete($ma_hp, $id_tai_lieu)
    {
        TlTaiLieuHocPhan::where("tai_lieu_id", $id_tai_lieu)->where("ma_hoc_phan", $ma_hp)->delete();
        $tai_lieu = TlTaiLieuHocPhan::where("tai_lieu_id", $id_tai_lieu)->get();
        $tai_lieu_lop_mon = TlTaiLieuLopMon::where("tai_lieu_id", $id_tai_lieu)->get();
        if (count($tai_lieu) == 0 && count($tai_lieu_lop_mon) == 0) {
            TlTaiLieu::where("id", $id_tai_lieu)->delete();
        }
        return response()->json(["message" => "Xóa tài liệu học phần thành công"], 200);
    }
}
