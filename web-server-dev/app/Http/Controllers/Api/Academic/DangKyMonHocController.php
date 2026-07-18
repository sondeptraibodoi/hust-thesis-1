<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\BangDiem;
use App\Models\DangKyMonHoc;
use App\Models\HocKy;
use App\Models\LopHocPhan;
use App\Models\MonHoc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DangKyMonHocController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = DangKyMonHoc::query()->with(['sinhVien', 'hocKy', 'monHoc', 'lopHocPhan.hocKy', 'lopHocPhan.monHoc', 'bangDiem']);

        if ($user->vai_tro === RoleCode::STUDENT) {
            $query->where('sinh_vien_id', $this->currentStudentId($request));
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
            $query->where('hoc_ky_id', $request->hoc_ky_id);
        }

        if ($request->filled('mon_hoc_id')) {
            $query->where('mon_hoc_id', $request->mon_hoc_id);
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->filled('lop_hoc_phan_id')) {
            $query->where('lop_hoc_phan_id', $request->lop_hoc_phan_id);
        }

        if ($request->filled('sinh_vien_id') && $user->vai_tro === RoleCode::ADMIN) {
            $query->where('sinh_vien_id', $request->sinh_vien_id);
        }

        return $this->responseSuccess($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function monMoDangKy(Request $request)
    {
        $user = $request->user();
        abort_unless($user->vai_tro === RoleCode::STUDENT, 403, 'Chi sinh vien duoc xem danh sach mon mo dang ky.');

        $sinhVienId = $this->currentStudentId($request);

        $registeredKeys = DangKyMonHoc::query()
            ->where('sinh_vien_id', $sinhVienId)
            ->whereIn('trang_thai', ['cho_xep_lop', 'da_dang_ky'])
            ->get(['hoc_ky_id', 'mon_hoc_id'])
            ->map(fn ($item) => $item->hoc_ky_id . '-' . $item->mon_hoc_id)
            ->all();

        $items = LopHocPhan::query()
            ->with(['hocKy', 'monHoc'])
            ->where('trang_thai', 'dang_mo')
            ->whereHas('hocKy', fn ($q) => $q->where('dang_mo_dang_ky', true))
            ->whereHas('monHoc', fn ($q) => $q->where('trang_thai', 'dang_mo'))
            ->get()
            ->groupBy(fn ($lop) => $lop->hoc_ky_id . '-' . $lop->mon_hoc_id)
            ->reject(fn ($group, $key) => in_array($key, $registeredKeys, true))
            ->map(function ($group, $key) {
                $first = $group->first();

                return [
                    'id' => $key,
                    'hoc_ky_id' => $first->hoc_ky_id,
                    'mon_hoc_id' => $first->mon_hoc_id,
                    'hoc_ky' => $first->hocKy,
                    'mon_hoc' => $first->monHoc,
                    'so_lop_mo' => $group->count(),
                    'cac_lop_mo' => $group->values(),
                ];
            })
            ->values();

        return $this->responseSuccess($items);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'hoc_ky_id' => 'nullable|exists:hoc_kies,id',
            'mon_hoc_id' => 'nullable|exists:mon_hocs,id',
            'lop_hoc_phan_id' => 'nullable|exists:lop_hoc_phans,id',
            'sinh_vien_id' => 'nullable|exists:sinh_viens,id',
        ]);

        $lopHocPhan = isset($data['lop_hoc_phan_id'])
            ? LopHocPhan::with(['hocKy', 'monHoc.monHocTienQuyets'])->findOrFail($data['lop_hoc_phan_id'])
            : null;

        $canManageLopHocPhan = $user->vai_tro === RoleCode::ADMIN
            || ($lopHocPhan && $user->isTeacher() && $lopHocPhan->giao_vien_bo_mon_id === optional($user->giaoVien)->id);

        $sinhVienId = $canManageLopHocPhan
            ? ($data['sinh_vien_id'] ?? null)
            : optional($user->sinhVien)->id;

        abort_unless($sinhVienId, 422, 'Khong tim thay sinh vien dang ky.');

        $hocKyId = $lopHocPhan?->hoc_ky_id ?? ($data['hoc_ky_id'] ?? null);
        $monHocId = $lopHocPhan?->mon_hoc_id ?? ($data['mon_hoc_id'] ?? null);

        abort_unless($hocKyId && $monHocId, 422, 'Can chon ky hoc va mon hoc dang ky.');

        $hocKy = $lopHocPhan?->hocKy ?? HocKy::findOrFail($hocKyId);
        $monHoc = $lopHocPhan?->monHoc ?? MonHoc::with('monHocTienQuyets')->findOrFail($monHocId);

        if ($user->vai_tro === RoleCode::STUDENT) {
            abort_unless($hocKy->dang_mo_dang_ky, 422, 'Hoc ky chua mo dang ky.');
            abort_unless($monHoc->trang_thai === 'dang_mo', 422, 'Mon hoc chua duoc mo dang ky.');
            abort_if($lopHocPhan, 422, 'Sinh vien chi dang ky mon hoc, admin se xep lop hoc phan sau.');
            abort_unless(
                LopHocPhan::where('hoc_ky_id', $hocKyId)->where('mon_hoc_id', $monHocId)->where('trang_thai', 'dang_mo')->exists(),
                422,
                'Mon hoc chua co lop hoc phan dang mo.'
            );
        } else {
            abort_unless($canManageLopHocPhan, 403, 'Khong co quyen them sinh vien vao lop hoc phan nay.');
        }

        if ($lopHocPhan && $lopHocPhan->si_so_toi_da) {
            $this->ensureClassHasCapacity($lopHocPhan);
        }

        $missingPrerequisite = $monHoc->monHocTienQuyets()
            ->whereDoesntHave('lopHocPhans.bangDiems', function ($q) use ($sinhVienId) {
                $q->where('sinh_vien_id', $sinhVienId)->where('ket_qua', 'qua_mon');
            })
            ->exists();

        abort_if($missingPrerequisite, 422, 'Sinh vien chua dat mon tien quyet.');

        $dangKy = DB::transaction(function () use ($sinhVienId, $hocKyId, $monHocId, $lopHocPhan) {
            $dangKy = DangKyMonHoc::updateOrCreate(
                [
                    'sinh_vien_id' => $sinhVienId,
                    'hoc_ky_id' => $hocKyId,
                    'mon_hoc_id' => $monHocId,
                ],
                [
                    'lop_hoc_phan_id' => $lopHocPhan?->id,
                    'trang_thai' => $lopHocPhan ? 'da_dang_ky' : 'cho_xep_lop',
                    'dang_ky_luc' => now(),
                    'huy_luc' => null,
                ]
            );

            if ($lopHocPhan) {
                $this->createOrUpdateBangDiem($dangKy, $lopHocPhan);
            }

            return $dangKy->fresh(['hocKy', 'monHoc', 'lopHocPhan.monHoc', 'bangDiem']);
        });

        return $this->responseCreated($dangKy);
    }

    public function xepLop(Request $request, $id)
    {
        abort_unless($request->user()->vai_tro === RoleCode::ADMIN, 403, 'Chi admin duoc xep lop hoc phan.');

        $data = $request->validate([
            'lop_hoc_phan_id' => 'required|exists:lop_hoc_phans,id',
        ]);

        $dangKy = DangKyMonHoc::with(['sinhVien', 'hocKy', 'monHoc'])->findOrFail($id);
        $lopHocPhan = LopHocPhan::with(['hocKy', 'monHoc'])->findOrFail($data['lop_hoc_phan_id']);

        abort_unless($dangKy->hoc_ky_id === $lopHocPhan->hoc_ky_id, 422, 'Lop hoc phan khong thuoc ky hoc sinh vien dang ky.');
        abort_unless($dangKy->mon_hoc_id === $lopHocPhan->mon_hoc_id, 422, 'Lop hoc phan khong dung mon sinh vien dang ky.');
        abort_unless($lopHocPhan->trang_thai === 'dang_mo', 422, 'Lop hoc phan khong dang mo.');
        $this->ensureClassHasCapacity($lopHocPhan, $dangKy->id);

        $dangKy = DB::transaction(function () use ($dangKy, $lopHocPhan) {
            $dangKy->update([
                'lop_hoc_phan_id' => $lopHocPhan->id,
                'trang_thai' => 'da_dang_ky',
                'huy_luc' => null,
            ]);

            $this->createOrUpdateBangDiem($dangKy, $lopHocPhan);

            return $dangKy->fresh(['sinhVien', 'hocKy', 'monHoc', 'lopHocPhan.hocKy', 'lopHocPhan.monHoc', 'bangDiem']);
        });

        return $this->responseUpdated($dangKy);
    }

    public function cancel(Request $request, $id)
    {
        $dangKy = DangKyMonHoc::with(['hocKy', 'lopHocPhan.hocKy'])->findOrFail($id);
        $user = $request->user();

        abort_unless(
            $user->vai_tro === RoleCode::ADMIN || $dangKy->sinh_vien_id === optional($user->sinhVien)->id,
            403,
            'Khong co quyen huy dang ky nay.'
        );

        $hocKy = optional($dangKy->lopHocPhan)->hocKy ?? $dangKy->hocKy;

        abort_unless($user->vai_tro === RoleCode::ADMIN || optional($hocKy)->dang_mo_dang_ky, 422, 'Hoc ky da dong dang ky.');

        $dangKy->update([
            'trang_thai' => 'da_huy',
            'huy_luc' => now(),
        ]);

        return $this->responseUpdated($dangKy->fresh(['hocKy', 'monHoc', 'lopHocPhan.monHoc']));
    }

    private function ensureClassHasCapacity(LopHocPhan $lopHocPhan, ?int $exceptDangKyId = null): void
    {
        if (!$lopHocPhan->si_so_toi_da) {
            return;
        }

        $current = $lopHocPhan->dangKyMonHocs()
            ->where('trang_thai', 'da_dang_ky')
            ->when($exceptDangKyId, fn ($query) => $query->where('id', '!=', $exceptDangKyId))
            ->count();

        abort_if($current >= $lopHocPhan->si_so_toi_da, 422, 'Lop hoc phan da du si so.');
    }

    private function createOrUpdateBangDiem(DangKyMonHoc $dangKy, LopHocPhan $lopHocPhan): BangDiem
    {
        return BangDiem::updateOrCreate(
            ['dang_ky_mon_hoc_id' => $dangKy->id],
            [
                'sinh_vien_id' => $dangKy->sinh_vien_id,
                'lop_hoc_phan_id' => $lopHocPhan->id,
                'ket_qua' => 'chua_co_diem',
                'trang_thai' => 'nhap_diem',
            ]
        );
    }

    private function currentStudentId(Request $request): int
    {
        $studentId = optional($request->user()->sinhVien)->id;
        abort_unless($studentId, 403, 'Khong tim thay ho so sinh vien cua tai khoan nay.');

        return $studentId;
    }
}
