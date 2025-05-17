<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Enums\LoaiBaiThi;
use App\Enums\LoaiThi;
use App\Enums\TrangThaiCauHoi;
use App\Helpers\DiemQTHelper;
use App\Helpers\SettingHelper;
use App\Http\Controllers\Controller;
use App\Models\BaiThi\HocPhanBaiThi;
use App\Models\BaiThi\HocPhanBaiThiCauHoi;
use App\Models\Diem\DiemHocPhanChuong;
use App\Models\Lop\Lop;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiChuong;
use App\Models\HocPhan\HocPhanChuong;
use Carbon\Carbon;
use DB;
use Log;
use Illuminate\Http\Request;

class ThiController extends Controller
{
    public function createExam(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $info_id = $request->user()->info_id;
            $user_id = $request->user()->getKey();
            $user = $request->user();
            $ma_hoc_phan = $request->input("ma_hoc_phan");
            $chuong_id = $request->input("chuong_id");
            $lop_id = $request->input("lop_id");
            $loaiThi = $request->input("loaiThi");
            $noSave = $request->input("noSave", !$user->isSinhVien || $loaiThi == LoaiBaiThi::THU);
            Log::channel("exam")->debug("create-exam", array_merge($request->all(), ["user_id" => $user_id]));
            $now = Carbon::now();

            $hp_chuong = HocPhanChuong::where("ma_hoc_phan", $ma_hoc_phan)->where("id", $chuong_id)->firstOrFail();

            $soCauHoi = $hp_chuong->so_cau_hoi;
            $time_start = Carbon::now()->addMinute()->setSecond(0);
            $time_thi = $hp_chuong->thoi_gian_thi;
            $time_end = $time_start->clone()->addMinutes($time_thi);
            $soCauHoi = $hp_chuong->so_cau_hoi;
            $diem_toi_da = $hp_chuong->diem_toi_da;
            $now = Carbon::now();
            if (!$noSave) {
                $lop = Lop::findOrFail($lop_id);
                if ($lop->loai_thi !== LoaiThi::Thi_Theo_Chuong) {
                    return response()->json(
                        [
                            "code" => "KHAC",
                            "message" => "Lớp hoặc kì học không hợp lệ",
                        ],
                        400
                    );
                }
                // chi kiem tra dieu kien thi vs thi that, thi thu khong gioi han
                if ($loaiThi == LoaiBaiThi::THAT) {
                    $helper = new SettingHelper();
                    $khoangNgay = $helper->getKhoangNgayDongMo(
                        $lop->tuan_hoc,
                        $hp_chuong->tuan_mo,
                        $hp_chuong->tuan_dong
                    );
                    $ngayMo = Carbon::parse($khoangNgay[0]);
                    $ngayDong = Carbon::parse($khoangNgay[1]);

                    if (isset($ngayMo) && $now->lessThan($ngayMo)) {
                        abort(
                            response(
                                [
                                    "code" => "KHAC",
                                    "message" => "Chưa đến thời điểm thi",
                                ],
                                400
                            )
                        );
                    }
                    if (isset($ngayDong) && $now->greaterThan($ngayDong)) {
                        abort(
                            response(
                                [
                                    "code" => "KHAC",
                                    "message" => "Hết thời gian thi",
                                ],
                                400
                            )
                        );
                    }
                    $isDaThiThat = DiemHocPhanChuong::query()
                        ->where("lop_id", $lop_id)
                        ->where("sinh_vien_id", $info_id)
                        ->where("chuong_id", $chuong_id)
                        ->orderBy("id", "desc")
                        ->exists();
                    if ($isDaThiThat) {
                        abort(
                            response(
                                [
                                    "code" => "KHAC",
                                    "message" => "Bài thi của chủ đề đã được thi",
                                ],
                                400
                            )
                        );
                    }
                }
                $bai_thi = HocPhanBaiThi::query()
                    ->where("lop_id", $lop_id)
                    ->where("chuong_id", $chuong_id)
                    ->where("user_id", $user_id)
                    ->where("loai", $loaiThi)
                    ->orderBy("id", "desc")
                    ->first();
                if ($bai_thi) {
                    // Lấy thời gian created_at
                    $created_at = $bai_thi->created_at;
                    // Lấy thời gian hiện tại
                    $time_end = $created_at->copy()->addMinutes($hp_chuong->thoi_gian_thi);
                    $now = Carbon::now();
                    if (empty($bai_thi->ket_thuc_thi_at) && $now < $time_end) {
                        abort(
                            response(
                                [
                                    "code" => "DANG_THI",
                                    "message" => "Sinh viên đang thi ở chỗ khác!",
                                ],
                                400
                            )
                        );
                    }
                    if (isset($bai_thi->ket_thuc_thi_at)) {
                        $created_at = $bai_thi->ket_thuc_thi_at;
                    }
                    // Tính khoảng thời gian giữa hiện tại và thời gian created_at
                    $diffInMinutes = $created_at->diffInMinutes($now);
                    if ($diffInMinutes < 10) {
                        abort(
                            response(
                                [
                                    "code" => "DOI_THOI_GIAN_THI",
                                    "data" => 10 - $diffInMinutes,
                                    "message" =>
                                        "Mỗi lượt thi sẽ cách nhau ít nhất 10 phút. Vui lòng đợi để có thể bắt đầu bài thi!",
                                ],
                                400
                            )
                        );
                    }
                }
            }
            $queryCauHois = HocPhanCauHoiChuong::where("ma_hoc_phan", $ma_hoc_phan)
                ->where("chuong_id", $chuong_id)
                ->orderByRaw("random()")
                ->whereHas("cauHoi", function ($query) {
                    $query->where("trang_thai", TrangThaiCauHoi::DangSuDung);
                })
                ->limit($soCauHoi);
            $queryCauHois->byLoaiThi($loaiThi, $chuong_id);
            $selectedCauHoiIds = $queryCauHois->pluck("cau_hoi_id")->unique()->toArray();
            $cauHois = HocPhanCauHoi::whereIn("id", $selectedCauHoiIds)
                ->where("trang_thai", TrangThaiCauHoi::DangSuDung)
                ->with([
                    "chuongs" => function ($q) use ($ma_hoc_phan, $chuong_id) {
                        $q->where("ma_hoc_phan", $ma_hoc_phan);
                        $q->where("chuong_id", $chuong_id);
                    },
                ])
                ->get()
                ->map(function ($cauHoi) {
                    $cauHoi->dap_an_id = $cauHoi->dap_an;
                    $cauHoi->dap_an = count($cauHoi->dap_an);
                    return $cauHoi;
                });
            if ($cauHois->count() < $soCauHoi) {
                return response()->json(
                    [
                        "code" => "SHOW_ERROR",
                        "message" =>
                            "Số lượng câu hỏi hiện tại chưa đủ để tổ chức thi. Vui lòng liên hệ với giáo viên để được cung cấp thêm thông tin.",
                    ],
                    400
                );
            }
            if (!$noSave) {
                $bai_thi = HocPhanBaiThi::create([
                    "lop_id" => $lop_id,
                    "chuong_id" => $chuong_id,
                    "user_id" => $user_id,
                    "sinh_vien_id" => $info_id,
                    "bat_dau_thi_at" => $time_start,
                    "thoi_gian_thi_cho_phep" => $time_thi,
                    "loai" => $loaiThi,
                    "so_cau_hoi" => $soCauHoi,
                    "diem_toi_da" => $diem_toi_da,
                ]);
                Log::channel("exam")->debug(
                    "create-exam",
                    array_merge(["bai_thi_id" => $bai_thi->getKey()], ["user_id" => $user_id])
                );
                // Lấy thời gian created_at
                $created_at = $bai_thi->created_at;
                // Lấy thời gian hiện tại
                $time_end = $created_at->copy()->addMinutes($hp_chuong->thoi_gian_thi);
                if ($loaiThi == LoaiBaiThi::THAT) {
                    DiemHocPhanChuong::updateOrCreate(
                        [
                            "lop_id" => $bai_thi->lop_id,
                            "sinh_vien_id" => $bai_thi->sinh_vien_id,
                            "chuong_id" => $bai_thi->chuong_id,
                        ],
                        [
                            "diem" => 0,
                            "thoi_gian_cong_khai" => $time_end,
                        ]
                    );
                }
            }
            foreach ($cauHois as $index => $cauHoi) {
                $lua_chons = $cauHoi->lua_chon;
                shuffle($lua_chons);
                if (!$noSave) {
                    HocPhanBaiThiCauHoi::create([
                        "bai_thi_id" => $bai_thi->id,
                        "cau_hoi_id" => $cauHoi->id,
                        "order" => $index,
                        "do_kho" => $cauHoi->chuongs[0]->do_kho,
                        "noi_dung" => $cauHoi->noi_dung,
                        "lua_chon" => json_encode($lua_chons),
                        "dap_an" => json_encode($cauHoi->dap_an_id),
                    ]);
                }
                foreach ($lua_chons as $key => $lua_chon) {
                    unset($lua_chon["correct"]);
                    $lua_chons[$key] = $lua_chon;
                }
                $cauHoi->lua_chon = $lua_chons;
                unset($cauHoi["dap_an_id"]);
                unset($cauHoi["dap_an"]);
                $cauHoi->makeHidden(["updated_at", "trang_thai", "chuongs", "created_at", "created_by_id"]);
            }
            return response()->json([
                "items" => $cauHois,
                "bai_thi_id" => isset($bai_thi) ? $bai_thi->getKey() : null,
                "thoi_gian_bat_dau" => $time_start,
                "thoi_gian_ket_thuc" => $time_end,
            ]);
        });
    }

    public function submitQuestion(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $user_id = $request->user()->info_id;
            $bai_thi_id = $request->input("bai_thi_id");
            Log::channel("exam")->debug("submit-question", array_merge($request->all(), ["user_id" => $user_id]));
            if (empty($bai_thi_id)) {
                return response()->json();
            }
            $cau_hoi_id = $request->input("cau_hoi_id");
            $dap_an = $request->input("dap_an");
            $bai_thi = HocPhanBaiThi::where("sinh_vien_id", $user_id)->findOrFail($bai_thi_id);
            $this->checkBaiThi($bai_thi);
            $cauhoi_baithi = HocPhanBaiThiCauHoi::query()
                ->where("bai_thi_id", $bai_thi->id)
                ->where("cau_hoi_id", $cau_hoi_id)
                ->firstOrFail();
            $corret_dap_an = json_decode($cauhoi_baithi->dap_an);
            sort($dap_an);
            sort($corret_dap_an);
            $is_correct = $dap_an == $corret_dap_an;
            $cauhoi_baithi->is_correct = $is_correct;
            $cauhoi_baithi->ket_qua = $dap_an;
            $cauhoi_baithi->save();
            $this->calcScore($bai_thi);
            return response()->json();
        });
    }
    public function submitAnswers(Request $request)
    {
        $user_id = $request->user()->getKey();
        $bai_thi_id = $request->get("bai_thi_id");
        $dap_ans = $request->get("dap_ans");
        $chuong_id = $request->get("chuong_id");
        $noSave = empty($bai_thi_id);
        $now = Carbon::now();
        if (!$noSave) {
            $bai_thi = HocPhanBaiThi::where("user_id", $user_id)->findOrFail($bai_thi_id);
            $this->checkBaiThi($bai_thi);
            $total_correct = HocPhanBaiThiCauHoi::query()
                ->where("bai_thi_id", $bai_thi->id)
                ->where("is_correct", true)
                ->count();
            $bai_thi->ket_thuc_thi_at = $now;
            $bai_thi->save();

            if ($bai_thi->loai == LoaiBaiThi::THAT) {
                DiemHocPhanChuong::updateOrCreate(
                    [
                        "lop_id" => $bai_thi->lop_id,
                        "sinh_vien_id" => $bai_thi->sinh_vien_id,
                        "chuong_id" => $bai_thi->chuong_id,
                    ],
                    [
                        "thoi_gian_cong_khai" => null,
                    ]
                );
            }
            return response()->json([
                "message" => "",
                "score" => $bai_thi->diem ?? 0,
                "correctAnswersCount" => $total_correct,
            ]);
        }
        $chuong = HocPhanChuong::findOrFail($chuong_id);
        $maxScore = $chuong->diem_toi_da;
        $totalQuestion = $chuong->so_cau_hoi;
        $scorePerQuestion = $maxScore / $totalQuestion;
        $correctAnswersCount = 0;
        $user = $request->user();
        foreach ($dap_ans as $questionId => $answer) {
            $userAnswerIds = $answer;
            $queryCauHois = HocPhanCauHoiChuong::query()->with("cauHoi");
            $queryCauHois->byLoaiThi(LoaiBaiThi::THU, $chuong_id);
            $question = $queryCauHois->find($questionId);
            $correctAnswerIds = $question["cauHoi"]["dap_an"];

            sort($userAnswerIds);
            sort($correctAnswerIds);

            if ($userAnswerIds == $correctAnswerIds) {
                $correctAnswersCount++;
            }
        }

        $score = $correctAnswersCount * $scorePerQuestion;
        $score = DiemQTHelper::ceil($score);
        return response()->json([
            "score" => $score,
            "correctAnswersCount" => $correctAnswersCount,
        ]);
    }
    private function calcScore(HocPhanBaiThi $bai_thi)
    {
        $total_correct = HocPhanBaiThiCauHoi::query()
            ->where("bai_thi_id", $bai_thi->id)
            ->where("is_correct", true)
            ->count();
        $maxScore = $bai_thi->diem_toi_da;
        $total = $bai_thi->so_cau_hoi;
        $scorePerQuestion = $maxScore / $total;
        $score = $total_correct * $scorePerQuestion;
        $score = DiemQTHelper::ceil($score);
        $bai_thi->diem = $score;
        $bai_thi->save();
        $loaiThi = $bai_thi->loai;
        if ($loaiThi == LoaiBaiThi::THAT) {
            DiemHocPhanChuong::updateOrCreate(
                [
                    "lop_id" => $bai_thi->lop_id,
                    "sinh_vien_id" => $bai_thi->sinh_vien_id,
                    "chuong_id" => $bai_thi->chuong_id,
                ],
                [
                    "diem" => $score,
                ]
            );
        }
    }
    private function checkBaiThi(HocPhanBaiThi $bai_thi)
    {
        $now = Carbon::now();
        $created_at = $bai_thi->bat_dau_thi_at;
        $ket_thuc_thi_at = $bai_thi->ket_thuc_thi_at;
        if (!empty($ket_thuc_thi_at)) {
            abort(
                response(
                    [
                        "message" => "Bài thi đã nộp",
                        "code" => "OVERTIME",
                        "diem" => $bai_thi->diem,
                    ],
                    400
                )
            );
        }
        $time_end = $created_at
            ->copy()
            ->addMinutes($bai_thi->thoi_gian_thi_cho_phep)
            ->addMinute();
        if ($time_end->lessThan($now)) {
            $bai_thi->ket_thuc_thi_at = $now;
            $bai_thi->save();
            abort(
                response(
                    [
                        "message" => "Đã quá thời gian nộp bài",
                        "code" => "OVERTIME",
                        "diem" => $bai_thi->diem,
                    ],
                    400
                )
            );
        }
    }
}
