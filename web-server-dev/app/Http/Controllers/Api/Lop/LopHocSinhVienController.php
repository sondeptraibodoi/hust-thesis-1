<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use App\Models\Lop\Lop;
use DB;
use App\Models\Lop\LopSinhVien;
use Illuminate\Http\Request;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Diem\Diem;
use App\Models\Lop\LopSinhVienDoAn;
use App\Models\Lop\LopThi;
use App\Models\Lop\LopThiSinhVien;
use Exception;

class LopHocSinhVienController extends Controller
{
    protected $includes = ["lop", "sinhVien"];

    // public function index($id)
    // {
    //     $query = Lop::query()->with('sinhViens');
    //     $lop = $query->findOrFail($id);
    //     return response()->json($lop->sinhViens, 200, []);
    // }

    public function index($id)
    {
        $query = Lop::query()->with([
            "sinhViens.lopSinhVienDoAn" => function ($query) use ($id) {
                return $query->where("lop_id", $id);
            },
            "sinhViens.lopSinhVienDoAn.giaoVien",
        ]);
        $lop = $query->findOrFail($id);

        $formattedData = $lop->sinhViens->map(function ($sinhVien) {
            $giaoVienData = $sinhVien->lopSinhVienDoAn->isEmpty()
                ? null
                : [
                    "id" => $sinhVien->lopSinhVienDoAn->first()->giaoVien->id,
                    "name" => $sinhVien->lopSinhVienDoAn->first()->giaoVien->name,
                    "email" => $sinhVien->lopSinhVienDoAn->first()->giaoVien->email,
                ];

            $lopSVDoAnData = $sinhVien->lopSinhVienDoAn->isEmpty()
                ? null
                : [
                    "ten_de_tai" => $sinhVien->lopSinhVienDoAn->first()->ten_de_tai,
                    "noi_dung" => $sinhVien->lopSinhVienDoAn->first()->noi_dung,
                    "cac_moc_quan_trong" => $sinhVien->lopSinhVienDoAn->first()->cac_moc_quan_trong,
                ];

            return [
                "id" => $sinhVien->id,
                "name" => $sinhVien->name,
                "email" => $sinhVien->email,
                "mssv" => $sinhVien->mssv,
                "birthday" => $sinhVien->birthday,
                "group" => $sinhVien->group,
                "created_at" => $sinhVien->created_at,
                "updated_at" => $sinhVien->updated_at,
                "pivot" => [
                    "lop_id" => $sinhVien->pivot->lop_id,
                    "sinh_vien_id" => $sinhVien->pivot->sinh_vien_id,
                    "stt" => $sinhVien->pivot->stt,
                    "diem_y_thuc" => $sinhVien->pivot->diem_y_thuc,
                    "nhom" => $sinhVien->pivot->nhom,
                    "diem" => $sinhVien->pivot->diem,
                ],
                "giaoVienHD" => $giaoVienData,
                "lopSVDoAn" => $lopSVDoAnData,
            ];
        });

        return response()->json($formattedData, 200, []);
    }

    public function update(Request $request, $id)
    {
        $request->validate(
            [
                "stt" => "required|integer|min:1",
                "sinh_viens" => "required|integer",
            ],
            [
                "stt.min" => "Trường STT không được phép nhỏ hơn 1",
                "stt.interger" => "Trường STT phải là số nguyên",
            ]
        );
        try {
            $lop = null;
            DB::transaction(function () use ($request, $id, &$lop) {
                $sinh_vien_ids = $request->input("sinh_viens");
                $stt = $request->input("stt");
                if ($stt < 1) {
                    abort(400, "Trường STT sinh viên không được phép nhỏ hơn 1");
                }
                $lop = Lop::findOrFail($id);
                $nhom = $request->get("nhom");
                $sinh_vien_lop = $lop->sinhViens()->where("id", $sinh_vien_ids)->first()->toArray();

                if ($stt < $sinh_vien_lop["pivot"]["stt"]) {
                    LopSinhVien::where("lop_id", $lop->id)
                        ->where("stt", ">=", $stt)
                        ->where("stt", "<", $sinh_vien_lop["pivot"]["stt"])
                        ->increment("stt");
                } elseif ($stt > $sinh_vien_lop["pivot"]["stt"]) {
                    LopSinhVien::where("lop_id", $lop->id)
                        ->where("stt", "<=", $stt)
                        ->where("stt", ">", $sinh_vien_lop["pivot"]["stt"])
                        ->decrement("stt");
                }
                $lop->sinhViens()->syncWithoutDetaching([
                    $sinh_vien_ids => ["stt" => $stt, "nhom" => $nhom],
                ]);
            });
            DB::commit();
            return $this->responseSuccess($lop);
        } catch (\Throwable $th) {
            DB::rollBack();
            return $this->responseError([], $th->getMessage());
        }
    }
    public function destroy(Request $request, $id)
    {
        $sinh_vien_id = $request->input("sinh_vien_id");
        $lop = Lop::findOrFail($id);
        $sinh_viens = $lop->sinhViens()->where("id", $sinh_vien_id)->first()->toArray();

        if (!$sinh_viens) {
            return response()->json(["message" => "Sinh viên không tồn tại trong lớp"], 404);
        }
        $is_exist_diem_sinh_vien = Diem::join("ph_lop_this", "ph_lop_this.id", "=", "ph_diems.lop_thi_id")
            ->join("ph_lops", "ph_lops.id", "=", "ph_lop_this.lop_id")
            ->where("sinh_vien_id", "=", $sinh_vien_id)
            ->where("ph_lops.id", $id)
            ->exists();
        if ($is_exist_diem_sinh_vien) {
            abort(400, "Sinh viên này đã có điểm nên không được phép xoá");
        }
        try {
            DB::transaction();
            $lop->sinhViens()->detach($sinh_vien_id);
            $sinh_vien_greater = LopSinhVien::where("lop_id", $lop->id)
                ->where("stt", $sinh_viens["pivot"]["stt"] + 1)
                ->exists();
            $sinh_vien_equal = LopSinhVien::where("lop_id", $lop->id)
                ->where("stt", $sinh_viens["pivot"]["stt"])
                ->exists();
            if ($sinh_vien_greater && !$sinh_vien_equal) {
                LopSinhVien::where("lop_id", $lop->id)
                    ->where("stt", ">", $sinh_viens["pivot"]["stt"])
                    ->decrement("stt");
            }
            DB::commit();
            return $this->responseSuccess($lop);
        } catch (\Throwable $th) {
            DB::rollBack();
            return $this->responseError([], $th->getMessage());
        }
    }
    public function indexSinhVienLopHoc(Request $request, $id)
    {
        $query = DB::table("ph_lop_sinh_viens")->join(
            "u_sinh_viens",
            "ph_lop_sinh_viens.sinh_vien_id",
            "=",
            "u_sinh_viens.id"
        );
        $query->where("ph_lop_sinh_viens.lop_id", "=", $id);
        $query->select(["ph_lop_sinh_viens.*", "u_sinh_viens.name", "u_sinh_viens.mssv"]);
        return response()->json($query->get(), 200, []);
    }
    public function diemYThuc(Request $request)
    {
        $data = $request->all();
        $count = count($data);
        for ($i = 0; $i < $count; $i++) {
            $value = $data[$i];
            $diem_y_thuc = $value["diem_y_thuc"] ?? 0;
            if ($diem_y_thuc > 1 || $diem_y_thuc < 0) {
                return response()->json(
                    [
                        "message" => "Điểm ý thức cần phải phải lớn hơn hoặc bằng 0 và nhỏ hơn 1",
                    ],
                    400
                );
            } elseif (!is_numeric($diem_y_thuc)) {
                return response()->json(["message" => "Điểm ý thức không đúng định dạng"], 400);
            } else {
                DB::table("ph_lop_sinh_viens")
                    ->where("sinh_vien_id", $value["pivot"]["sinh_vien_id"])
                    ->where("lop_id", $request->id)
                    ->update(["diem_y_thuc" => $diem_y_thuc]);
            }
        }
    }
    public function listLopThi(Request $request)
    {
        $loai = $request->input("loai");
        $ki_hoc = $request->input("ki_hoc");
        $lopThi = LopThi::where("loai", $loai)->whereHas("lop", function ($query) use ($ki_hoc) {
            $query->where("ki_hoc", $ki_hoc);
        });
        return response()->json($lopThi->get(), 200, []);
    }
    public function listSinhVien(Request $request)
    {
        $lop_thi_id = $request->input("lop_thi_id");

        if (!isset($lop_thi_id)) {
            return response()->json([], 200, []);
        }

        $query = DB::table("ph_lop_thi_sinh_viens")->join(
            "u_sinh_viens",
            "ph_lop_thi_sinh_viens.sinh_vien_id",
            "=",
            "u_sinh_viens.id"
        );
        $query->where("ph_lop_thi_sinh_viens.lop_thi_id", "=", $lop_thi_id);
        $query->select(["ph_lop_thi_sinh_viens.*", "u_sinh_viens.name", "u_sinh_viens.mssv"]);
        return response()->json($query->get(), 200, []);
    }
    public function indexForLopThiBu($id)
    {
        $query = DB::table("ph_lop_thi_sinh_viens")
            ->leftJoin("ph_diems", function ($join) {
                $join->on("ph_lop_thi_sinh_viens.sinh_vien_id", "ph_diems.sinh_vien_id");
                $join->on("ph_lop_thi_sinh_viens.lop_thi_id", "ph_diems.lop_thi_id");
            })
            ->join("u_sinh_viens", "ph_lop_thi_sinh_viens.sinh_vien_id", "=", "u_sinh_viens.id")
            ->join("ph_lop_this", "ph_lop_thi_sinh_viens.lop_thi_goc_id", "=", "ph_lop_this.id");
        $query->orderBy("ph_lop_thi_sinh_viens.stt");
        $query->select([
            "ph_lop_thi_sinh_viens.stt",
            DB::raw("ph_diems.id as diem_id"),
            "ph_lop_thi_sinh_viens.sinh_vien_id",
            "u_sinh_viens.name",
            "u_sinh_viens.mssv",
            "u_sinh_viens.group",
            "ph_diems.diem",
            "ph_diems.ghi_chu",
            "ph_lop_thi_sinh_viens.lop_thi_goc_id",
            DB::raw("ph_lop_this.id as lop_thi_id"),
            "ph_lop_this.ma",
        ]);
        $query->where("ph_lop_thi_sinh_viens.lop_thi_id", $id);
        return $query->get();
    }
    public function addSinhVien(Request $request)
    {
        $lop_thi_id = $request->input("lop_thi_id");
        $lop_thi_goc_id = $request->input("lop_thi_goc_id");
        $sinh_vien_id = $request->input("sinh_vien_id");

        $exists = DB::table("ph_lop_thi_sinh_viens")
            ->where("lop_thi_id", $lop_thi_id)
            ->where("sinh_vien_id", $sinh_vien_id)
            ->where("lop_thi_goc_id", $lop_thi_goc_id)
            ->exists();

        if ($exists) {
            return response()->json(["message" => "Sinh viên và lớp thi đã tồn tại trong bảng"], 404);
        }
        try {
            DB::beginTransaction();
            $data = $request->all();
            $next_sv_greater = LopThiSinhVien::where("lop_thi_id", $data["lop_thi_id"])
                ->where("stt", "=", $data["stt"] + 1)
                ->exists();
            $next_sv_equal = LopThiSinhVien::where("lop_thi_id", $data["lop_thi_id"])
                ->where("stt", "=", $data["stt"])
                ->exists();
            $lop_thi = LopThiSinhVien::where("lop_thi_id", $data["lop_thi_id"]);
            if ($next_sv_equal && $next_sv_greater) {
                $lop_thi->where("stt", ">=", $data["stt"])->increment("stt");
            } elseif ($next_sv_equal && !$next_sv_greater) {
                $lop_thi->where("stt", "=", $data["stt"])->increment("stt");
            }
            $data = LopThiSinhVien::create($data);
            DB::commit();
            return $this->responseSuccess($data);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->responseError([], $e->getMessage());
        }
    }

    // public function updateSVDoAn(Request $request, $id)
    // {
    //     $request->validate([
    //         'stt' => 'required|integer|min:1',
    //         'sinh_viens' => 'required|integer'
    //     ], [
    //         'stt.min' => 'Trường STT không được phép nhỏ hơn 1',
    //         'stt.interger' => 'Trường STT phải là số nguyên'
    //     ]);
    //     try {
    //         DB::transaction();
    //         $sinh_vien_ids = $request->input('sinh_viens');
    //         $stt = $request->input('stt');
    //         if ($stt < 1) {
    //             abort(400, 'Trường STT sinh viên không được phép nhỏ hơn 1');
    //         }
    //         $lop = Lop::findOrFail($id);
    //         $nhom = $request->get('nhom');
    //         $sinh_vien_lop = $lop->sinhViens()->where('id', $sinh_vien_ids)->first()->toArray();

    //         if ($stt < $sinh_vien_lop['pivot']['stt']) {
    //             LopSinhVien::where('lop_id', $lop->id)->where('stt', '>=', $stt)->where('stt', '<', $sinh_vien_lop['pivot']['stt'])->increment('stt');
    //         } elseif ($stt > $sinh_vien_lop['pivot']['stt']) {
    //             LopSinhVien::where('lop_id', $lop->id)->where('stt', '<=', $stt)->where('stt', '>', $sinh_vien_lop['pivot']['stt'])->decrement('stt');
    //         }
    //         $lop->sinhViens()->syncWithoutDetaching([
    //             $sinh_vien_ids => ['stt' => $stt, 'nhom' => $nhom],

    //         ]);
    //         DB::commit();
    //         return $this->responseSuccess($lop);
    //     } catch (\Throwable $th) {
    //         DB::rollBack();
    //         return $this->responseError([], $th->getMessage());
    //     }
    // }

    public function updateSVDoAn(Request $request, $id)
    {
        $request->validate(
            [
                "stt" => "required|integer|min:1",
                "sinh_viens" => "required|integer",
            ],
            [
                "stt.min" => "Trường STT không được phép nhỏ hơn 1",
                "stt.integer" => "Trường STT phải là số nguyên",
            ]
        );

        try {
            DB::beginTransaction();

            $sinh_vien_ids = $request->input("sinh_viens");
            $stt = $request->input("stt");
            $nhom = $request->input("nhom");
            $giao_viens_ids = $request->get("giao_viens");
            $ten_de_tai = $request->get("ten_de_tai");
            $noi_dung = $request->get("noi_dung");
            $cac_moc_quan_trong = $request->get("cac_moc_quan_trong");
            if ($stt < 1) {
                abort(400, "Trường STT sinh viên không được phép nhỏ hơn 1");
            }

            $lop = Lop::findOrFail($id);

            // Lấy thông tin sinh viên trong lớp
            $sinh_vien_lop = $lop->sinhViens()->where("id", $sinh_vien_ids)->first();

            if ($stt < 1) {
                abort(400, "Trường STT sinh viên không được phép nhỏ hơn 1");
            }

            if ($stt < $sinh_vien_lop["pivot"]["stt"]) {
                LopSinhVien::where("lop_id", $lop->id)
                    ->where("stt", ">=", $stt)
                    ->where("stt", "<", $sinh_vien_lop["pivot"]["stt"])
                    ->increment("stt");
            } elseif ($stt > $sinh_vien_lop["pivot"]["stt"]) {
                LopSinhVien::where("lop_id", $lop->id)
                    ->where("stt", "<=", $stt)
                    ->where("stt", ">", $sinh_vien_lop["pivot"]["stt"])
                    ->decrement("stt");
            }

            // Cập nhật STT và nhóm cho sinh viên trong lớp
            $lop->sinhViens()->syncWithoutDetaching([
                $sinh_vien_ids => ["stt" => $stt, "nhom" => $nhom],
            ]);

            // Cập nhật STT cho các sinh viên khác trong lớp
            // if ($sinh_vien_lop) {
            //     $current_stt = $sinh_vien_lop->pivot->stt;

            //     if ($stt < $current_stt) {
            //         // Tăng STT cho sinh viên có STT lớn hơn hoặc bằng $stt và nhỏ hơn $current_stt
            //         $lop->sinhViens()->wherePivot('stt', '>=', $stt)
            //             ->wherePivot('stt', '<', $current_stt)
            //             ->increment('stt');
            //     } elseif ($stt > $current_stt) {
            //         // Giảm STT cho sinh viên có STT nhỏ hơn hoặc bằng $stt và lớn hơn $current_stt
            //         $lop->sinhViens()->wherePivot('stt', '<=', $stt)
            //             ->wherePivot('stt', '>', $current_stt)
            //             ->decrement('stt');
            //     }
            // }

            $sinh_vien_do_an = LopSinhVienDoAn::where("lop_id", $id)->where("sinh_vien_id", $sinh_vien_ids)->first();

            if ($sinh_vien_do_an) {
                $sinh_vien_do_an->update([
                    "nhom" => $nhom,
                    "giao_vien_id" => $giao_viens_ids,
                    "ten_de_tai" => $ten_de_tai,
                    "noi_dung" => $noi_dung,
                    "cac_moc_quan_trong" => $cac_moc_quan_trong,
                ]);
            }

            DB::commit();
            return $this->responseSuccess($lop);
        } catch (\Throwable $th) {
            DB::rollBack();
            return $this->responseError([], $th->getMessage());
        }
    }

    public function destroySVDoAn(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $sinhVienId = $request->input("sinh_vien_id");

            LopSinhVienDoAn::where("lop_id", $id)->where("sinh_vien_id", $sinhVienId)->delete();
            LopSinhVien::where("lop_id", $id)->where("sinh_vien_id", $sinhVienId)->delete();

            DB::commit();

            return $this->responseSuccess("Xóa sinh viên đồ án và thông tin sinh viên thành công");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->responseError([], "Đã xảy ra lỗi khi xóa sinh viên đồ án: " . $e->getMessage());
        }
    }
}
