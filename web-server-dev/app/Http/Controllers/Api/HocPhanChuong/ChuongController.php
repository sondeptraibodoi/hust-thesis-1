<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\Lop\MaHocPhan;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanChuong;
use App\Models\HocPhan\HocPhanChuongTaiLieu;
use Illuminate\Http\Request;
use Storage;

class ChuongController extends Controller
{
    public function list(Request $request, $id)
    {
        $mhp = MaHocPhan::findOrFail($id);
        $query = HocPhanChuong::query()
            ->where("ma_hoc_phan", $mhp->ma)
            ->orderBy("trang_thai")
            ->orderBy("stt")
            ->orderBy("id");
        $query->with("taiLieus");
        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function store(Request $request)
    {
        $info = $request->all();
        $query = HocPhanChuong::create($info);
        return $this->responseSuccess($query);
    }
    public function update(Request $request, $id)
    {
        $info = $request->validate([
            "ten" => "required|min:1",
            "thoi_gian_doc" => "required|numeric",
            "thoi_gian_thi" => "required|numeric",
            "tuan_mo" => "required|numeric",
            "tuan_dong" => "required|numeric|gte:tuan_mo",
            "so_cau_hoi" => "required|numeric",
            "diem_toi_da" => "required|numeric",
            "trang_thai" => "required",
            "stt" => "numeric",
        ]);

        $query = HocPhanChuong::findOrFail($id);
        $query->update($info);
        return $this->responseSuccess($query);
    }
    public function destroy($id)
    {
        $disk = Storage::disk("public");
        $hp_Chuong = HocPhanChuong::findOrFail($id);
        $tai_lieu_chuong = "tai-lieus/$id";
        if ($disk->exists($tai_lieu_chuong)) {
            $disk->deleteDirectory($tai_lieu_chuong);
        }
        $tl_Chuong = HocPhanChuongTaiLieu::query()->where("chuong_id", $id);
        $cauhoi_Chuong = HocPhanCauHoiChuong::query()->where("chuong_id", $id);
        $diem_chuong = DiemHocPhanChuong::query()->where("chuong_id", $id);

        if ($cauhoi_Chuong->exists() || $diem_chuong->exists()) {
            return response()->json(
                [
                    "error" => "Không thể xóa chủ đề học phần vì vẫn còn dữ liệu liên quan",
                ],
                400
            );
        }

        $tl_Chuong->delete();
        $hp_Chuong->delete();
        return response()->json([
            "message" => "Xóa chủ đề học phần thành công",
        ]);
    }
    public function destroyTaiLieuChuong($id)
    {
        $tl_Chuong = HocPhanChuongTaiLieu::findOrFail($id);
        $duong_dan = $tl_Chuong->duong_dan;
        $duong_dan_xem = $tl_Chuong->duong_dan_xem;
        $new_duong_dan = str_replace("/storage/", "", $duong_dan);
        $new_duong_dan_xem = str_replace("/storage/", "", $duong_dan_xem);
        $disk = Storage::disk("public");

        if ($disk->exists($new_duong_dan)) {
            // return $new_duong_dan;
            $disk->delete($new_duong_dan);
        }

        if ($disk->exists($new_duong_dan_xem)) {
            $disk->deleteDirectory($new_duong_dan_xem);
        }
        $tl_Chuong->delete();

        return response()->json([
            "message" => "Xóa tài liệu chủ đề thành công",
        ]);
    }
}
