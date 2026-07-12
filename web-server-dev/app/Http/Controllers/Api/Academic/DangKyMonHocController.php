<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\BangDiem;
use App\Models\DangKyMonHoc;
use App\Models\LopHocPhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DangKyMonHocController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = DangKyMonHoc::query()->with(['sinhVien', 'lopHocPhan.hocKy', 'lopHocPhan.monHoc', 'bangDiem']);

        if ($user->vai_tro === RoleCode::STUDENT) {
            $query->where('sinh_vien_id', optional($user->sinhVien)->id);
        }

        if ($user->isTeacher()) {
            $giaoVienId = optional($user->giaoVien)->id;
            $query->where(function ($teacherQuery) use ($giaoVienId) {
                $teacherQuery
                    ->whereHas('lopHocPhan', function ($q) use ($giaoVienId) {
                        $q->where('giao_vien_bo_mon_id', $giaoVienId);
                    })
                    ->orWhereHas('sinhVien.lopHanhChinh', function ($q) use ($giaoVienId) {
                        $q->where('giao_vien_chu_nhiem_id', $giaoVienId);
                    });
            });
        }

        if ($request->filled('hoc_ky_id')) {
            $query->whereHas('lopHocPhan', function ($q) use ($request) {
                $q->where('hoc_ky_id', $request->hoc_ky_id);
            });
        }

        if ($request->filled('lop_hoc_phan_id')) {
            $query->where('lop_hoc_phan_id', $request->lop_hoc_phan_id);
        }

        if ($request->filled('sinh_vien_id') && $user->vai_tro === RoleCode::ADMIN) {
            $query->where('sinh_vien_id', $request->sinh_vien_id);
        }

        return $this->responseSuccess($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'lop_hoc_phan_id' => 'required|exists:lop_hoc_phans,id',
            'sinh_vien_id' => 'nullable|exists:sinh_viens,id',
        ]);

        $sinhVienId = $user->vai_tro === RoleCode::ADMIN
            ? ($data['sinh_vien_id'] ?? null)
            : optional($user->sinhVien)->id;

        abort_unless($sinhVienId, 422, 'Khong tim thay sinh vien dang ky.');

        $lopHocPhan = LopHocPhan::with(['hocKy', 'monHoc.monHocTienQuyets'])->findOrFail($data['lop_hoc_phan_id']);

        abort_unless($user->vai_tro === RoleCode::ADMIN || $lopHocPhan->hocKy->dang_mo_dang_ky, 422, 'Hoc ky chua mo dang ky.');
        abort_unless($lopHocPhan->trang_thai === 'dang_mo', 422, 'Lop hoc phan khong dang mo.');

        if ($lopHocPhan->si_so_toi_da) {
            $current = $lopHocPhan->dangKyMonHocs()->where('trang_thai', 'da_dang_ky')->count();
            abort_if($current >= $lopHocPhan->si_so_toi_da, 422, 'Lop hoc phan da du si so.');
        }

        $missingPrerequisite = $lopHocPhan->monHoc->monHocTienQuyets()
            ->whereDoesntHave('lopHocPhans.bangDiems', function ($q) use ($sinhVienId) {
                $q->where('sinh_vien_id', $sinhVienId)->where('ket_qua', 'qua_mon');
            })
            ->exists();

        abort_if($missingPrerequisite, 422, 'Sinh vien chua dat mon tien quyet.');

        $dangKy = DB::transaction(function () use ($sinhVienId, $lopHocPhan) {
            $dangKy = DangKyMonHoc::updateOrCreate(
                [
                    'sinh_vien_id' => $sinhVienId,
                    'lop_hoc_phan_id' => $lopHocPhan->id,
                ],
                [
                    'trang_thai' => 'da_dang_ky',
                    'dang_ky_luc' => now(),
                    'huy_luc' => null,
                ]
            );

            BangDiem::firstOrCreate(
                ['dang_ky_mon_hoc_id' => $dangKy->id],
                [
                    'sinh_vien_id' => $sinhVienId,
                    'lop_hoc_phan_id' => $lopHocPhan->id,
                    'ket_qua' => 'chua_co_diem',
                    'trang_thai' => 'nhap_diem',
                ]
            );

            return $dangKy->fresh(['lopHocPhan.monHoc', 'bangDiem']);
        });

        return $this->responseCreated($dangKy);
    }

    public function cancel(Request $request, $id)
    {
        $dangKy = DangKyMonHoc::with('lopHocPhan.hocKy')->findOrFail($id);
        $user = $request->user();

        abort_unless(
            $user->vai_tro === RoleCode::ADMIN || $dangKy->sinh_vien_id === optional($user->sinhVien)->id,
            403,
            'Khong co quyen huy dang ky nay.'
        );

        abort_unless($user->vai_tro === RoleCode::ADMIN || $dangKy->lopHocPhan->hocKy->dang_mo_dang_ky, 422, 'Hoc ky da dong dang ky.');

        $dangKy->update([
            'trang_thai' => 'da_huy',
            'huy_luc' => now(),
        ]);

        return $this->responseUpdated($dangKy->fresh(['lopHocPhan.monHoc']));
    }
}
