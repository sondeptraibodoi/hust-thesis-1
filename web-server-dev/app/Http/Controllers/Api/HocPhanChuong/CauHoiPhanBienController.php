<?php

namespace App\Http\Controllers\Api\HocPhanChuong;

use App\Enums\TrangThaiCauHoi;
use App\Enums\TrangThaiPhanBienCauHoi;
use App\Http\Controllers\Controller;
use App\Library\Log\LogHelper;
use App\Library\Log\LogTypeCode;
use App\Models\HocPhan\HocPhanCauHoi;
use App\Models\HocPhan\HocPhanCauHoiPhanBien;
use App\Models\User\GiaoVien;
use DB;
use Illuminate\Http\Request;

class CauHoiPhanBienController extends Controller
{
    public function updateOrCreate(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $request->validate([
                "ngay_han_phan_bien" => ["required"],
                "giao_vien_id" => ["required"],
            ]);
            $user = $request->user();
            $hp_cau_hoi = HocPhanCauHoi::findOrFail($id);
            if (
                !in_array($hp_cau_hoi->trang_thai, [
                    TrangThaiCauHoi::ChoDuyet1,
                    TrangThaiCauHoi::ChoDuyet2,
                    TrangThaiCauHoi::ChoPhanBien,
                    TrangThaiCauHoi::ChoPhanBien2,
                ])
            ) {
                abort(400, "Câu hỏi không thể thay đổi phản biện ở trạng thái này");
            }

            $info = $request->all();
            $giao_vien_id = $info["giao_vien_id"];
            $phan_bien_id = $info["phan_bien_id"] ?? null;
            $ngay_han_phan_bien = $info["ngay_han_phan_bien"];
            $giao_vien_phan_bien = GiaoVien::findOrFail($giao_vien_id);
            $data = [
                "cau_hoi_id" => $id,
                "giao_vien_id" => $giao_vien_id,
                "trang_thai_cau_hoi" => TrangThaiPhanBienCauHoi::ChoDuyet,
            ];

            if ($ngay_han_phan_bien) {
                $data["ngay_han_phan_bien"] = $ngay_han_phan_bien;
            }
            if (isset($phan_bien_id)) {
                $phan_bien = HocPhanCauHoiPhanBien::findOrFail($phan_bien_id);
                $phan_bien->update($data);
            } else {
                if ($hp_cau_hoi->trang_thai == TrangThaiCauHoi::ChoPhanBien2) {
                    $data["lan"] = 2;
                } else {
                    $data["lan"] = 1;
                }
                $phan_bien = HocPhanCauHoiPhanBien::create($data);
            }
            if ($hp_cau_hoi->trang_thai === TrangThaiCauHoi::ChoPhanBien) {
                $hp_cau_hoi->update(["trang_thai" => TrangThaiCauHoi::ChoDuyet1]);
            } elseif ($hp_cau_hoi->trang_thai === TrangThaiCauHoi::ChoPhanBien2) {
                $hp_cau_hoi->update(["trang_thai" => TrangThaiCauHoi::ChoDuyet2]);
            }

            $log = LogHelper::fromType(LogTypeCode::CAUHOI_GIAOGIAOVIEN);
            $log->causerBy($user);
            $log->withActor($user, "nguoi_giao", $user->getCauserDisplay());
            $log->withActor($giao_vien_phan_bien, "giao_vien_phe_duyet", $giao_vien_phan_bien->getCauserDisplay());
            $log->withActor($hp_cau_hoi, "cau_hoi");
            $log = $log->save();
            return $this->responseSuccess();
        });
    }
}
