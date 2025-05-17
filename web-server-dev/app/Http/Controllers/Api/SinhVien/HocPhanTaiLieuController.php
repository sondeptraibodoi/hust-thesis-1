<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Enums\LoaiThi;
use App\Helpers\HustHelper;
use App\Helpers\SettingHelper;
use App\Http\Controllers\Controller;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\Diem\DiemHocPhanChuongView;
use App\Models\Lop\Lop;
use App\Models\HocPhan\HocPhanChuong;
use Arr;
use Carbon\Carbon;
use Illuminate\Http\Request;

class HocPhanTaiLieuController extends Controller
{
    public function index(Request $request, $id)
    {
        $user = $request->user();
        $lop = Lop::findOrFail($id);
        if ($lop->loai_thi !== LoaiThi::Thi_Theo_Chuong) {
            abort(400);
        }
        $sinh_vien_id = $request->user()->info_id;
        $now = Carbon::now();
        $ma_hp = $lop->ma_hp;
        $kiHienGio = HustHelper::getKiHoc($now);

        $result = HocPhanChuong::where("ma_hoc_phan", $ma_hp)
            ->where("trang_thai", "1-Đang sử dụng")
            ->orderBy("stt")
            ->orderBy("id")
            ->with([
                "taiLieus" => function ($query) {
                    $query->orderBy("created_at", "asc");
                },
                "maHp" => function ($query) {
                    $query->select("id", "ten_hp", "ma");
                },
            ])
            ->orderBy("stt", "asc")
            ->get();
        $can_exam = $lop->ki_hoc == $kiHienGio;
        $diems = [];
        if ($user->isSinhVien) {
            $diems = DiemHocPhanChuongView::where("sinh_vien_id", $sinh_vien_id)
                ->where("lop_id", $id)
                ->get()
                ->mapWithKeys(function ($item, $key) {
                    return [$item["chuong_id"] => $item["diem"]];
                });
        }

        $result = $result
            ->map(function ($chuong) use ($lop, $now, $diems, $can_exam) {
                $helper = new SettingHelper();
                $khoangNgay = $helper->getKhoangNgayDongMo($lop->tuan_hoc, $chuong->tuan_mo, $chuong->tuan_dong);
                $ngayMo = Carbon::parse($khoangNgay[0]);
                $ngayDong = Carbon::parse($khoangNgay[1]);
                $chuong = $chuong->toArray();
                unset($chuong["updated_at"]);
                unset($chuong["created_at"]);
                Arr::set($chuong, "extra.da_co_diem", isset($diems[$chuong["id"]]));
                Arr::set($chuong, "extra.can_exam", $can_exam && $now->between($ngayMo, $ngayDong));
                Arr::set($chuong, "extra.ngay_mo_thi", $ngayMo->format(config("app.format_date")));
                Arr::set($chuong, "extra.ngay_dong_thi", $ngayDong->format(config("app.format_date")));
                return $chuong;
            })
            ->filter();

        return response()->json(["chuongs" => $result->values()->all(), "diems" => $diems ?? [], "lop" => $lop], 200);
    }
}
