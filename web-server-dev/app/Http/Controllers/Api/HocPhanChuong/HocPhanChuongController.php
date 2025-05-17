<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\LoaiBaiThi;
use App\Helpers\SettingHelper;
use App\Http\Controllers\Controller;
use App\Models\HocPhan\HocPhanChuong;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Diem\DiemHocPhanChuongView;
use App\Models\Lop\Lop;
use App\Models\Lop\MaHocPhan;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanChuongTaiLieu;
use App\Models\HocPhan\HocPhanUser;
use DB;
use Illuminate\Database\Query\JoinClause;
use Storage;

class HocPhanChuongController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $hp_user = HocPhanUser::query();
        if (isset($user->id)) {
            $hp_user->where("user_id", $user->id)->distinct();
        }
        $query = DB::query()->fromSub(function ($query2) use ($hp_user) {
            $query2
                ->from("ph_ma_hoc_phans")
                ->joinSub($hp_user, "hp_user", function (JoinClause $join) {
                    $join->on("hp_user.ma_hoc_phan", "=", "ph_ma_hoc_phans.ma");
                })
                ->leftJoin("hp_chuongs", "ph_ma_hoc_phans.ma", "hp_chuongs.ma_hoc_phan");

            $query2
                ->select([
                    "ph_ma_hoc_phans.id",
                    "ph_ma_hoc_phans.ma",
                    "ph_ma_hoc_phans.ten_hp",
                    "hp_user.ma_hoc_phan",
                    "hp_user.user_id",
                    DB::raw("COUNT(hp_chuongs.ma_hoc_phan) as count_chuong"), // Đếm số lượng chuong
                ])
                ->groupBy(
                    "ph_ma_hoc_phans.id",
                    "ph_ma_hoc_phans.ma",
                    "ph_ma_hoc_phans.ten_hp",
                    "hp_user.ma_hoc_phan",
                    "hp_user.user_id"
                );
        }, "hoc_phan_chuong");
        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->defaultSort("ma")->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function show($id)
    {
        $query = MaHocPhan::query()
            ->leftJoin("hp_chuongs", "ph_ma_hoc_phans.ma", "=", "hp_chuongs.ma_hoc_phan")
            ->where("ph_ma_hoc_phans.id", $id);
        $query
            ->select(
                "ph_ma_hoc_phans.ma",
                DB::raw("ph_ma_hoc_phans.ma as ma_hoc_phan"),
                "ph_ma_hoc_phans.ten_hp",
                DB::raw("COUNT(hp_chuongs.ma_hoc_phan) as count_chuong")
            )
            ->groupBy("ph_ma_hoc_phans.ma", "ph_ma_hoc_phans.ten_hp");
        return response()->json($query->first(), 200, []);
    }

    public function detailThongKe($id)
    {
        $chuong = HocPhanChuong::findOrFail($id);
        $query = HocPhanCauHoiChuong::where("chuong_id", $id);
        $count_cau_hoi = $query->count();
        $count_cau_hoi_dang_su_dung = $query->clone()->active()->count();
        $count_cau_hoi_thi_thu = $query
            ->clone()
            ->byLoaiThi(LoaiBaiThi::THU, $id)
            ->count();
        $count_cau_hoi_thi_that = $query
            ->clone()
            ->byLoaiThi(LoaiBaiThi::THAT, $id)
            ->count();
        return [
            "count_cau_hoi" => $count_cau_hoi,
            "count_cau_hoi_dang_su_dung" => $count_cau_hoi_dang_su_dung,
            "count_cau_hoi_thi_thu" => $count_cau_hoi_thi_thu,
            "count_cau_hoi_thi_that" => $count_cau_hoi_thi_that,
        ];
    }

    public function upload(Request $request, $id)
    {
        if ($request->hasFile("file")) {
            // Lấy tệp được gửi lên
            $file = $request->file("file");
            $disk = Storage::disk("public");
            $originalName = $file->getClientOriginalName();

            // đếm trang
            $pdftext = file_get_contents($file);
            $numePage = preg_match_all("/\/Page\W/", $pdftext, $dummy);

            $path = "tai-lieus/$id/" . $originalName;
            Storage::disk("public")->put($path, file_get_contents($request->file));

            HocPhanChuongTaiLieu::where("ten", $originalName)->where("chuong_id", $id)->delete();
            // Đường dẫn công khai của file
            $public_url_file = $disk->url($path);
            $data = [
                "chuong_id" => $id,
                "ten" => $originalName,
                "duong_dan" => $public_url_file,
                "so_trang" => $numePage,
                "duong_dan_xem" => $public_url_file,
            ];
            $result = HocPhanChuongTaiLieu::create($data);
            return $this->responseSuccess($result);
        } else {
            // Trường hợp không có tệp được gửi lên
            return response()->json(["error" => "No file uploaded"], 400);
        }
    }

    public function fetchPdf(Request $request)
    {
        $filePath = $request->duong_dan;
        $url_path = str_replace("/storage/", "", $filePath);

        if (Storage::disk("public")->exists($url_path)) {
            // Lấy nội dung của file
            $fileContents = Storage::disk("public")->get($url_path);

            // Lấy loại MIME của file
            $mimeType = Storage::disk("public")->mimeType($url_path);

            // Trả về phản hồi HTTP hiển thị PDF
            return response($fileContents, 200)->header("Content-Type", $mimeType);
        } else {
            abort(404, "File không tồn tại");
        }
    }

    public function detail($id)
    {
        $query = HocPhanChuong::findOrFail($id);
        return $this->responseSuccess($query);
    }
    public function listTaiLieu($id)
    {
        $query = HocPhanChuongTaiLieu::query()->where("chuong_id", $id);
        return $this->responseSuccess($query->get());
    }

    public function listChuongHocPhanSV(Request $request)
    {
        $user = $request->user();
        $ki_hoc = $request->input("ki_hoc");

        if (!$user->is_sinh_vien) {
            abort(403);
        }
        $sinh_vien_id = $user->info_id;
        $query = Lop::query()->with([
            "hocPhanChuongs",
            "hocPhanChuongs.diemHocPhanChuong" => function ($query) use ($sinh_vien_id) {
                $query->where("sinh_vien_id", $sinh_vien_id);
            },
        ]);
        $query->where("loai", "like", "%BT%");
        $query->whereHas("sinhViens", function ($query) use ($sinh_vien_id) {
            $query->where("id", $sinh_vien_id);
        });

        if ($ki_hoc) {
            $query->where("ki_hoc", $ki_hoc);
        }

        $filteredResults = $query->get()->filter(function ($lop) {
            return $lop->hocPhanChuongs->count() > 0;
        });

        $today = Carbon::today();

        $diems = DiemHocPhanChuongView::where("sinh_vien_id", $sinh_vien_id)
            ->whereIn("lop_id", $filteredResults->pluck("id"))
            ->get()
            ->mapWithKeys(function ($item, $key) {
                return [$item["chuong_id"] => $item["diem"]];
            });
        $flattenedResults = $filteredResults
            ->map(function ($lop) use ($today, $diems) {
                return $lop->hocPhanChuongs
                    ->map(function ($chuong) use ($lop, $today, $diems) {
                        $helper = new SettingHelper();
                        $khoangNgay = $helper->getKhoangNgayDongMo(
                            $lop->tuan_hoc,
                            $chuong->tuan_mo,
                            $chuong->tuan_dong
                        );
                        $ngayMo = Carbon::parse($khoangNgay[0]);
                        $ngayDong = Carbon::parse($khoangNgay[1]);

                        if ($chuong->trang_thai === "1-Đang sử dụng" && $today->between($ngayMo, $ngayDong)) {
                            $diem = $diems[$chuong->id] ?? null;
                            return [
                                "id" => $chuong->id,
                                "ma_hoc_phan" => $chuong->ma_hoc_phan,
                                "stt" => $chuong->stt,
                                "ten" => $chuong->ten,
                                "mo_ta" => $chuong->mo_ta,
                                "trang_thai" => $chuong->trang_thai,
                                "tuan_dong" => $chuong->tuan_dong,
                                "tuan_mo" => $chuong->tuan_mo,
                                "thoi_gian_thi" => $chuong->thoi_gian_thi,
                                "thoi_gian_doc" => $chuong->thoi_gian_doc,
                                "so_cau_hoi" => $chuong->so_cau_hoi,
                                "diem_toi_da" => $chuong->diem_toi_da,
                                "ki_hoc" => $lop->ki_hoc,
                                "ma" => $lop->ma,
                                "lop_id" => $lop->id,
                                "diem" => $diem,
                            ];
                        }
                        return null;
                    })
                    ->filter();
            })
            ->flatten(1);

        return response()->json(new \App\Http\Resources\Items($flattenedResults), 200, []);
    }
}
