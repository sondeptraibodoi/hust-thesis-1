<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\BangDiem;
use App\Models\Auth\User;
use App\Models\LopHanhChinh;
use App\Models\SinhVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GiaoVienChuNhiemController extends Controller
{
    public function sinhViens(Request $request)
    {
        $user = $request->user();
        $query = SinhVien::query()->with(['lopHanhChinh', 'chuongTrinhDaoTao']);

        if ($request->filled('available_for_lop_hanh_chinh_id')) {
            $lop = LopHanhChinh::findOrFail($request->available_for_lop_hanh_chinh_id);
            $this->authorizeClassManage($request, $lop);

            $query->where(function ($q) use ($lop) {
                $q->whereNull('lop_hanh_chinh_id')
                    ->orWhere('lop_hanh_chinh_id', '!=', $lop->id);
            });
        } elseif ($user->isTeacher()) {
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

    public function assignSinhViens(Request $request, $lopId)
    {
        $lop = LopHanhChinh::findOrFail($lopId);
        $this->authorizeClassManage($request, $lop);

        $data = $request->validate([
            'sinh_vien_ids' => 'required|array|min:1',
            'sinh_vien_ids.*' => 'integer|exists:sinh_viens,id',
        ]);

        SinhVien::query()
            ->whereIn('id', $data['sinh_vien_ids'])
            ->update(['lop_hanh_chinh_id' => $lop->id]);

        return $this->responseSuccess([
            'updated' => count($data['sinh_vien_ids']),
        ]);
    }

    public function removeSinhVien(Request $request, $lopId, $sinhVienId)
    {
        $lop = LopHanhChinh::findOrFail($lopId);
        $this->authorizeClassManage($request, $lop);

        $sinhVien = SinhVien::where('lop_hanh_chinh_id', $lop->id)->findOrFail($sinhVienId);
        $sinhVien->update(['lop_hanh_chinh_id' => null]);

        return $this->responseUpdated($sinhVien);
    }

    public function createSinhVien(Request $request, $lopId)
    {
        $lop = LopHanhChinh::findOrFail($lopId);
        $this->authorizeClassManage($request, $lop);

        $data = $request->validate([
            'mssv' => 'required|string|max:255|unique:sinh_viens,mssv',
            'ho_ten' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:nguoi_dungs,email|unique:sinh_viens,email',
            'password' => 'nullable|string|min:6',
            'ngay_sinh' => 'nullable|date',
        ]);

        $sinhVien = DB::transaction(function () use ($data, $lop) {
            $user = User::create([
                'username' => $data['email'],
                'email' => $data['email'],
                'ho_ten' => $data['ho_ten'],
                'mat_khau' => bcrypt($data['password'] ?? '12345678'),
                'vai_tro' => RoleCode::STUDENT,
                'trang_thai' => true,
            ]);

            return SinhVien::create([
                'nguoi_dung_id' => $user->id,
                'lop_hanh_chinh_id' => $lop->id,
                'mssv' => $data['mssv'],
                'ho_ten' => $data['ho_ten'],
                'email' => $data['email'],
                'ngay_sinh' => $data['ngay_sinh'] ?? null,
            ]);
        });

        return $this->responseCreated($sinhVien->fresh(['lopHanhChinh']));
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

        if ($user->isTeacher()) {
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

        $bangDiems = $sinhVien->bangDiems->map(function (BangDiem $bangDiem) {
            $bangDiem->ket_qua = $this->resolveResult($bangDiem);

            return $bangDiem;
        });

        $passed = $bangDiems->where('ket_qua', 'qua_mon')->values();
        $failed = $bangDiems->where('ket_qua', 'truot')->values();
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

    private function authorizeClassManage(Request $request, LopHanhChinh $lop): void
    {
        $user = $request->user();

        if ($user->vai_tro === RoleCode::ADMIN) {
            return;
        }

        if ($user->isTeacher() && $lop->giao_vien_chu_nhiem_id === optional($user->giaoVien)->id) {
            return;
        }

        abort(403, 'Khong co quyen quan ly sinh vien trong lop nay.');
    }

    private function resolveResult(BangDiem $bangDiem): string
    {
        if ($bangDiem->diem_tong_ket === null) {
            return 'chua_co_diem';
        }

        $diemQuaMon = $bangDiem->lopHocPhan->monHoc->diem_qua_mon
            ?? $bangDiem->lopHocPhan->hocKy->diem_qua_mon_mac_dinh
            ?? 4;

        foreach (['diem_chuyen_can', 'diem_giua_ky', 'diem_cuoi_ky', 'diem_tong_ket'] as $field) {
            $currentScore = $bangDiem->{$field};

            if ($currentScore !== null && (float) $currentScore < (float) $diemQuaMon) {
                return 'truot';
            }
        }

        return 'qua_mon';
    }
}
