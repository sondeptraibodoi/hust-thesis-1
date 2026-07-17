<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\BangDiem;
use App\Models\LichSuChamDiem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BangDiemController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = BangDiem::query()->with(['sinhVien', 'lopHocPhan.hocKy', 'lopHocPhan.monHoc', 'nguoiCham']);

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

        if ($request->filled('lop_hoc_phan_id')) {
            $query->where('lop_hoc_phan_id', $request->lop_hoc_phan_id);
        }

        if ($request->filled('sinh_vien_id') && $user->vai_tro === RoleCode::ADMIN) {
            $query->where('sinh_vien_id', $request->sinh_vien_id);
        }

        return $this->responseSuccess($query->paginate($request->get('per_page', 20)));
    }

    public function update(Request $request, $id)
    {
        $bangDiem = BangDiem::with('lopHocPhan.hocKy', 'lopHocPhan.monHoc')->findOrFail($id);
        $this->authorizeGrade($request, $bangDiem);

        abort_if($bangDiem->trang_thai === 'da_chot' && $request->user()->vai_tro !== RoleCode::ADMIN, 422, 'Bang diem da chot.');

        $data = $request->validate([
            'diem_chuyen_can' => 'nullable|numeric|min:0|max:10',
            'diem_giua_ky' => 'nullable|numeric|min:0|max:10',
            'diem_cuoi_ky' => 'nullable|numeric|min:0|max:10',
            'diem_tong_ket' => 'nullable|numeric|min:0|max:10',
            'diem_chu' => 'nullable|string|max:4',
            'ghi_chu' => 'nullable|string',
        ]);

        $bangDiem = DB::transaction(function () use ($bangDiem, $data, $request) {
            $before = $bangDiem->only(['diem_chuyen_can', 'diem_giua_ky', 'diem_cuoi_ky', 'diem_tong_ket', 'diem_chu', 'ket_qua']);

            $data['diem_tong_ket'] = $data['diem_tong_ket'] ?? $this->calculateFinalScore($data, $bangDiem);
            $data['ket_qua'] = $this->resolveResult($bangDiem, $data['diem_tong_ket']);
            $data['nguoi_cham_id'] = optional($request->user()->giaoVien)->id;
            $data['ngay_cham'] = now();

            $bangDiem->update($data);

            LichSuChamDiem::create([
                'bang_diem_id' => $bangDiem->id,
                'nguoi_cham_id' => optional($request->user()->giaoVien)->id,
                'loai_cham' => 'lan_dau',
                'diem_truoc' => $before,
                'diem_sau' => $bangDiem->only(['diem_chuyen_can', 'diem_giua_ky', 'diem_cuoi_ky', 'diem_tong_ket', 'diem_chu', 'ket_qua']),
                'ly_do' => $data['ghi_chu'] ?? null,
            ]);

            return $bangDiem->fresh(['sinhVien', 'lopHocPhan.monHoc', 'nguoiCham']);
        });

        return $this->responseUpdated($bangDiem);
    }

    public function chotDiem(Request $request, $id)
    {
        $bangDiem = BangDiem::with('lopHocPhan')->findOrFail($id);
        $this->authorizeGrade($request, $bangDiem);

        $bangDiem->update([
            'trang_thai' => 'da_chot',
            'nguoi_chot_id' => $request->user()->id,
            'ngay_chot' => now(),
        ]);

        return $this->responseUpdated($bangDiem->fresh(['sinhVien', 'lopHocPhan.monHoc']));
    }

    private function authorizeGrade(Request $request, BangDiem $bangDiem): void
    {
        $user = $request->user();

        if ($user->vai_tro === RoleCode::ADMIN) {
            return;
        }

        if ($user->isTeacher() && $bangDiem->lopHocPhan->giao_vien_bo_mon_id === optional($user->giaoVien)->id) {
            return;
        }

        abort(403, 'Khong co quyen cham diem lop hoc phan nay.');
    }

    private function currentStudentId(Request $request): int
    {
        $studentId = optional($request->user()->sinhVien)->id;
        abort_unless($studentId, 403, 'Khong tim thay ho so sinh vien cua tai khoan nay.');

        return $studentId;
    }

    private function calculateFinalScore(array $data, BangDiem $bangDiem): ?float
    {
        $cc = $data['diem_chuyen_can'] ?? $bangDiem->diem_chuyen_can;
        $gk = $data['diem_giua_ky'] ?? $bangDiem->diem_giua_ky;
        $ck = $data['diem_cuoi_ky'] ?? $bangDiem->diem_cuoi_ky;

        if ($cc === null || $gk === null || $ck === null) {
            return null;
        }

        return round($cc * 0.1 + $gk * 0.3 + $ck * 0.6, 2);
    }

    private function resolveResult(BangDiem $bangDiem, ?float $diemTongKet): string
    {
        if ($diemTongKet === null) {
            return 'chua_co_diem';
        }

        $diemQuaMon = $bangDiem->lopHocPhan->monHoc->diem_qua_mon
            ?? $bangDiem->lopHocPhan->hocKy->diem_qua_mon_mac_dinh
            ?? 4;

        return $diemTongKet >= $diemQuaMon ? 'qua_mon' : 'truot';
    }
}
