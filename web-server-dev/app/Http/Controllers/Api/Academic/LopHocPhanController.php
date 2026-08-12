<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\LopHocPhan;
use Illuminate\Http\Request;

class LopHocPhanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LopHocPhan::query()->with(['hocKy', 'monHoc', 'giaoVienBoMon']);

        if ($request->filled('hoc_ky_id')) {
            $query->where('hoc_ky_id', $request->hoc_ky_id);
        }

        if ($request->filled('mon_hoc_id')) {
            $query->where('mon_hoc_id', $request->mon_hoc_id);
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->filled('mon_hoc_trang_thai')) {
            $query->whereHas('monHoc', function ($q) use ($request) {
                $q->where('trang_thai', $request->mon_hoc_trang_thai);
            });
        }

        if ($user->isTeacher()) {
            $giaoVienId = optional($user->giaoVien)->id;
            if ($request->boolean('teaching_only')) {
                $query->where('giao_vien_bo_mon_id', $giaoVienId);
            } else {
                $query->where(function ($teacherQuery) use ($giaoVienId) {
                    $teacherQuery
                        ->where('giao_vien_bo_mon_id', $giaoVienId)
                        ->orWhereHas('dangKyMonHocs.sinhVien.lopHanhChinh', function ($q) use ($giaoVienId) {
                            $q->where('giao_vien_chu_nhiem_id', $giaoVienId);
                        });
                });
            }
        }

        if ($user->vai_tro === RoleCode::STUDENT) {
            if ($request->boolean('registered')) {
                $query->whereHas('dangKyMonHocs', function ($q) use ($user) {
                    $q->where('sinh_vien_id', optional($user->sinhVien)->id);
                });
            } else {
                $query->where('trang_thai', 'dang_mo')
                    ->whereDoesntHave('dangKyMonHocs', function ($q) use ($user) {
                        $q->where('sinh_vien_id', optional($user->sinhVien)->id)
                            ->where('trang_thai', 'da_dang_ky');
                    })
                    ->whereHas('monHoc', function ($q) {
                        $q->where('trang_thai', 'dang_mo');
                    })
                    ->whereHas('hocKy', function ($q) {
                        $q->where('dang_mo_dang_ky', true);
                    });
            }
        }

        return $this->responseSuccess($query->paginate($this->perPage($request)));
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'hoc_ky_id' => 'required|exists:hoc_kies,id',
            'mon_hoc_id' => 'required|exists:mon_hocs,id',
            'giao_vien_bo_mon_id' => 'nullable|exists:giao_viens,id',
            'ma_lop_hoc_phan' => 'required|string|max:255',
            'ten_lop_hoc_phan' => 'nullable|string|max:255',
            'si_so_toi_da' => 'nullable|integer|min:1',
            'phong_hoc' => 'nullable|string|max:255',
            'lich_hoc' => 'nullable|string|max:255',
            'ca_hoc' => 'nullable|string|max:255',
            'trang_thai' => 'nullable|string|max:32',
        ]);

        return $this->responseCreated(LopHocPhan::create($data));
    }

    public function show(Request $request, $id)
    {
        $lopHocPhan = LopHocPhan::with([
            'hocKy',
            'monHoc',
            'giaoVienBoMon',
            'dangKyMonHocs.sinhVien',
            'bangDiems.sinhVien',
        ])->findOrFail($id);

        $this->authorizeLopHocPhan($request, $lopHocPhan);

        return $this->responseSuccess($lopHocPhan);
    }

    public function update(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $lopHocPhan = LopHocPhan::findOrFail($id);
        $data = $request->validate([
            'hoc_ky_id' => 'sometimes|required|exists:hoc_kies,id',
            'mon_hoc_id' => 'sometimes|required|exists:mon_hocs,id',
            'giao_vien_bo_mon_id' => 'nullable|exists:giao_viens,id',
            'ma_lop_hoc_phan' => 'sometimes|required|string|max:255',
            'ten_lop_hoc_phan' => 'nullable|string|max:255',
            'si_so_toi_da' => 'nullable|integer|min:1',
            'phong_hoc' => 'nullable|string|max:255',
            'lich_hoc' => 'nullable|string|max:255',
            'ca_hoc' => 'nullable|string|max:255',
            'trang_thai' => 'nullable|string|max:32',
        ]);

        $lopHocPhan->update($data);

        return $this->responseUpdated($lopHocPhan->fresh(['hocKy', 'monHoc', 'giaoVienBoMon']));
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureAdmin($request);

        LopHocPhan::findOrFail($id)->delete();

        return $this->responseDeleted();
    }

    private function authorizeLopHocPhan(Request $request, LopHocPhan $lopHocPhan): void
    {
        $user = $request->user();

        if ($user->vai_tro === RoleCode::ADMIN) {
            return;
        }

        if ($user->isTeacher() && $lopHocPhan->giao_vien_bo_mon_id === optional($user->giaoVien)->id) {
            return;
        }

        if ($user->isTeacher() && $lopHocPhan->dangKyMonHocs()->whereHas('sinhVien.lopHanhChinh', function ($q) use ($user) {
            $q->where('giao_vien_chu_nhiem_id', optional($user->giaoVien)->id);
        })->exists()) {
            return;
        }

        if ($user->vai_tro === RoleCode::STUDENT && $lopHocPhan->dangKyMonHocs()->where('sinh_vien_id', optional($user->sinhVien)->id)->exists()) {
            return;
        }

        abort(403, 'Khong co quyen xem lop hoc phan nay.');
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()->vai_tro === RoleCode::ADMIN, 403, 'Khong co quyen thuc hien thao tac nay.');
    }
}
