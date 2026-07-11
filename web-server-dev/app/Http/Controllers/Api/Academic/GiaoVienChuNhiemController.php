<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\SinhVien;
use Illuminate\Http\Request;

class GiaoVienChuNhiemController extends Controller
{
    public function sinhViens(Request $request)
    {
        $user = $request->user();
        $query = SinhVien::query()->with(['lopHanhChinh', 'chuongTrinhDaoTao']);

        if ($user->vai_tro === RoleCode::HOMEROOM_TEACHER) {
            $query->whereHas('lopHanhChinh', function ($q) use ($user) {
                $q->where('giao_vien_chu_nhiem_id', optional($user->giaoVien)->id);
            });
        } elseif ($user->vai_tro !== RoleCode::ADMIN) {
            abort(403, 'Khong co quyen xem danh sach sinh vien chu nhiem.');
        }

        if ($request->filled('lop_hanh_chinh_id')) {
            $query->where('lop_hanh_chinh_id', $request->lop_hanh_chinh_id);
        }

        return $this->responseSuccess($query->paginate($request->get('per_page', 20)));
    }

    public function tongQuanSinhVien(Request $request, $id)
    {
        $user = $request->user();
        $sinhVien = SinhVien::with([
            'lopHanhChinh',
            'chuongTrinhDaoTao.monHocs',
            'dangKyMonHocs.lopHocPhan.hocKy',
            'dangKyMonHocs.lopHocPhan.monHoc',
            'bangDiems.lopHocPhan.hocKy',
            'bangDiems.lopHocPhan.monHoc',
        ])->findOrFail($id);

        if ($user->vai_tro === RoleCode::HOMEROOM_TEACHER) {
            abort_unless(
                optional($sinhVien->lopHanhChinh)->giao_vien_chu_nhiem_id === optional($user->giaoVien)->id,
                403,
                'Khong co quyen xem sinh vien nay.'
            );
        } elseif ($user->vai_tro !== RoleCode::ADMIN) {
            abort(403, 'Khong co quyen xem sinh vien nay.');
        }

        $registered = $sinhVien->dangKyMonHocs->map(function ($dangKy) {
            return [
                'dang_ky_id' => $dangKy->id,
                'trang_thai' => $dangKy->trang_thai,
                'lop_hoc_phan' => $dangKy->lopHocPhan,
                'mon_hoc' => optional($dangKy->lopHocPhan)->monHoc,
                'hoc_ky' => optional($dangKy->lopHocPhan)->hocKy,
            ];
        })->values();

        $passed = $sinhVien->bangDiems->where('ket_qua', 'qua_mon')->values();
        $failed = $sinhVien->bangDiems->where('ket_qua', 'truot')->values();
        $passedSubjectIds = $passed->map(fn ($item) => $item->lopHocPhan->mon_hoc_id)->unique();

        $requiredSubjects = optional($sinhVien->chuongTrinhDaoTao)->monHocs ?? collect();
        $owedSubjects = $requiredSubjects->filter(function ($monHoc) use ($passedSubjectIds) {
            return $monHoc->pivot->bat_buoc && !$passedSubjectIds->contains($monHoc->id);
        })->values();

        return $this->responseSuccess([
            'sinh_vien' => $sinhVien,
            'mon_dang_ky' => $registered,
            'mon_dang_hoc' => $registered->where('trang_thai', 'da_dang_ky')->values(),
            'mon_da_qua' => $passed,
            'mon_bi_truot' => $failed,
            'mon_con_no' => $owedSubjects,
        ]);
    }
}
