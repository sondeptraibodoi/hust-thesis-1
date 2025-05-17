<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\TrangThaiCauHoi;
use App\Http\Controllers\Controller;
use App\Library\Log\LogHelper;
use App\Library\Log\LogTypeCode;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanCauHoiForGiaoVien;
use DB;
use Illuminate\Http\Request;

class CauHoiController extends Controller
{
    public function show(Request $request, $id)
    {
        $query = HocPhanCauHoiForGiaoVien::query();
        $query = QueryBuilder::for($query, $request);
        $query->allowedIncludes([
            "primaryChuong",
            "primaryChuong.chuong",
            "primaryChuong.maHp",
            "primaryChuong.loaiThi",
            "chuongs",
            "chuongs.chuong",
            "phanBien",
            "phanBien.giaoVien",
            "createdBy",
        ]);
        $data = $query->findOrFail($id);
        if ($data->relationLoaded("phanBien") && isset($data["phanBien"])) {
            $phanBien = $data["phanBien"];
            if ($phanBien["lan"] != $data->lanPhanBienYeuCau) {
                $data->setRelation("phanBien", null);
            }
        }
        return $data;
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            "noi_dung" => "required|string",
            "lua_chon" => "required|array",
            "dap_an" => "required|array",
        ]);
        if ($request->has("chuongs")) {
            $request->validate([
                "chuongs" => "array",
                "chuongs.*.ma_hoc_phan" => "required|string",
                "chuongs.*.do_kho" => "required|string",
                "chuongs.*.chuong_id" => "required",
            ]);
        }
        return DB::transaction(function () use ($request, $id) {
            $cauHoi = HocPhanCauHoiForGiaoVien::findOrFail($id);
            $data = $request->all();
            $user = $request->user();
            if ($request->has("chuongs")) {
                HocPhanCauHoiChuong::where("cau_hoi_id", $id)->delete();
                $chuongs = array_map(function ($item) {
                    return new HocPhanCauHoiChuong([
                        "ma_hoc_phan" => $item["ma_hoc_phan"],
                        "chuong_id" => $item["chuong_id"],
                        "do_kho" => $item["do_kho"],
                        "is_primary" => $item["is_primary"] ?? false,
                    ]);
                }, $data["chuongs"]);
                $cauHoi->chuongs()->saveMany($chuongs);
            }
            $cauHoi->update([
                "noi_dung" => $request->input("noi_dung"),
                "loai" => count($request->input("dap_an")) === 1 ? "single" : "multi",
                "lua_chon" => $request->input("lua_chon"),
                "dap_an" => $request->input("dap_an"),
            ]);

            $giao_vien = $user->info ?? $user;
            $log = LogHelper::fromType(LogTypeCode::CAUHOI_UPDATE);
            $log->causerBy($user);
            $log->withActor($giao_vien, "created_by", $giao_vien->getCauserDisplay());
            $log->withActor($cauHoi, "cau_hoi");
            $log = $log->save();
            return $this->responseUpdated();
        });
    }
}
