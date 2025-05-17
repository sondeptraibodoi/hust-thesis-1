<?php

namespace App\Http\Controllers\Api\TaiLieu;

use App\Enums\TaiLieuPhamVi;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Lop\Lop;
use Illuminate\Http\Request;
use App\Models\TaiLieu\TlTaiLieu;
use App\Models\TaiLieu\TlTaiLieuLopMon;
use DB;
use Illuminate\Validation\Rule;

class GiaoVienTaiLieuController extends Controller
{
    // public function index(Request $request)
    // {

    //     $user = $request->user();

    //     $query = TlTaiLieu::query()
    //         ->join('tl_tai_lieu_lop_mon', 'tl_tai_lieus.id', '=', 'tl_tai_lieu_lop_mon.tai_lieu_id')
    //         ->join('ph_lops', 'tl_tai_lieu_lop_mon.lop_id', '=', 'ph_lops.id')
    //         ->where('created_by_id', $user->id)
    //         ->with(['createdBy' => function ($query) {
    //             $query->select('id', 'username');
    //         }, 'loaiTaiLieu' => function ($query) {
    //             $query->select('id', 'ma', 'loai');
    //         },])
    //         ->orderBy('created_at', 'desc')
    //         ->select('tl_tai_lieus.*','ph_lops.ma as ma_lop','ph_lops.ghi_chu as loai_lop','ph_lóp.id as lop_id');

    //     $query = QueryBuilder::for($query, $request)
    //         ->allowedAgGrid([])
    //         ->allowedSorts('nguoi_tao')
    //         ->defaultSort('created_at')
    //         ->allowedPagination();
    //        $data = array();

    //     return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    // }
    public function index(Request $request)
    {
        $user = $request->user();
        $query = TlTaiLieu::query()
            ->where("created_by_id", $user->id)
            ->with([
                "createdBy" => function ($query) {
                    $query->select("id", "username");
                },
                "loaiTaiLieu" => function ($query) {
                    $query->select("id", "ma", "loai");
                },
                "lops" => function ($query) {
                    $query->select("id", "ma", "ma_hp", "ten_hp", "ghi_chu");
                },
            ])
            ->orderBy("created_at", "desc");
        $query->has("lops");
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
        $result->lops()->sync($request->lop_id);
        return $this->responseSuccess($result);
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            "ma" => ["required", "string", "max:255"],
            "loai_tai_lieu_id" => ["required", "exists:tl_loai_tai_lieus,id"],
            "ten" => ["required", "string", "max:255"],
            "link" => ["required", "string"],
        ]);
        $info = $request->all();
        $tai_lieu = TlTaiLieu::findOrFail($id);
        $tai_lieu->update($info);
        $tai_lieu->lops()->sync($request->get("lop_id"));
        return $this->responseSuccess($tai_lieu);
    }
    public function destroy($id)
    {
        $deleted_tai_lieu_lop_mon = DB::table("tl_tai_lieu_lop_mon")->where("tai_lieu_id", "=", $id)->delete();
        $deleted = DB::table("tl_tai_lieus")->where("id", "=", $id)->delete();
        return $this->responseSuccess($deleted);
    }
    public function taiLieuLop(Request $request, $id)
    {
        $tai_lieu_ids = TlTaiLieuLopMon::where("lop_id", $id)->pluck("tai_lieu_id");
        $taiLieus = TlTaiLieu::whereIn("id", $tai_lieu_ids)
            ->with([
                "createdBy" => function ($query) {
                    $query->select("id", "username");
                },
                "loaiTaiLieu" => function ($query) {
                    $query->select("id", "ma", "loai");
                },
            ])
            ->orderBy("created_at", "desc")
            ->get();

        return response()->json($taiLieus, 200);
    }

    public function gvThemTaiLieuLop(Request $request, $lopId)
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
        $taiLieu = TlTaiLieu::create($info);
        $taiLieu->lops()->syncWithoutDetaching([$lopId]);

        $recordExists = TlTaiLieuLopMon::where("tai_lieu_id", $taiLieu->id)
            ->where("lop_id", $lopId)
            ->exists();

        if (!$recordExists) {
            TlTaiLieuLopMon::create([
                "tai_lieu_id" => $taiLieu->id,
                "lop_id" => $lopId,
            ]);
        }

        return $this->responseSuccess($taiLieu);
    }

    public function gvXoaTaiLieuLop(Request $request, $lopId)
    {
        $taiLieuId = $request->id;
        $countLops = TlTaiLieu::find($taiLieuId)->lops()->count();

        if ($countLops > 1) {
            DB::table("tl_tai_lieu_lop_mon")->where("tai_lieu_id", $taiLieuId)->where("lop_id", $lopId)->delete();
        } else {
            DB::table("tl_tai_lieu_lop_mon")->where("tai_lieu_id", $taiLieuId)->delete();
            TlTaiLieu::destroy($taiLieuId);
        }

        return response()->json(["message" => "Xóa tài liệu thành công"], 200);
    }
    public function gvThemNhieuTaiLieuLop(Request $request, $lopId, $lopTaiLieuId = null)
    {
        $taiLieuIds = $request->all();
        if ($lopTaiLieuId !== null) {
            $taiLieuLopMon = TlTaiLieuLopMon::where("lop_id", $lopTaiLieuId)->get();
            $taiLieuIds = $taiLieuLopMon->pluck("tai_lieu_id")->toArray();

            foreach ($taiLieuIds as $taiLieuId) {
                TlTaiLieuLopMon::updateOrCreate(
                    ["tai_lieu_id" => $taiLieuId, "lop_id" => $lopId],
                    ["tai_lieu_id" => $taiLieuId, "lop_id" => $lopId]
                );
            }
            return $this->responseSuccess("Thêm tài liệu cho lớp thành công");
        } else {
            if (!empty($taiLieuIds)) {
                if (is_array($taiLieuIds)) {
                    foreach ($taiLieuIds as $taiLieuId) {
                        TlTaiLieuLopMon::updateOrCreate(
                            ["tai_lieu_id" => $taiLieuId, "lop_id" => $lopId],
                            ["tai_lieu_id" => $taiLieuId, "lop_id" => $lopId]
                        );
                    }
                    return $this->responseSuccess("Thêm tài liệu cho lớp thành công");
                } else {
                    return $this->responseError("Dữ liệu không hợp lệ");
                }
            } else {
                return $this->responseError("Không tìm thấy");
            }
        }
    }
}
