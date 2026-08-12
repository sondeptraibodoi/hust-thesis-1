<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\BangDiem;
use App\Models\LichSuChamDiem;
use App\Models\PhucKhao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PhucKhaoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = PhucKhao::query()->with(['sinhVien', 'lopHocPhan.monHoc', 'bangDiem', 'giaoVienXuLy']);

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

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->filled('lop_hoc_phan_id')) {
            $query->where('lop_hoc_phan_id', $request->lop_hoc_phan_id);
        }

        return $this->responseSuccess($query->latest()->paginate($this->perPage($request)));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->vai_tro === RoleCode::STUDENT, 403, 'Chi sinh vien duoc gui phuc khao.');

        $data = $request->validate([
            'bang_diem_id' => 'required|exists:bang_diems,id',
            'noi_dung' => 'required|string',
        ]);

        $bangDiem = BangDiem::with('lopHocPhan.hocKy')->findOrFail($data['bang_diem_id']);

        abort_unless($bangDiem->sinh_vien_id === optional($user->sinhVien)->id, 403, 'Khong co quyen phuc khao bang diem nay.');
        abort_unless($bangDiem->trang_thai === 'da_chot', 422, 'Bang diem chua duoc cong bo.');
        abort_unless($bangDiem->lopHocPhan->hocKy->dang_mo_phuc_khao, 422, 'Học kỳ chưa mở phúc khảo.');

        $phucKhao = PhucKhao::create([
            'bang_diem_id' => $bangDiem->id,
            'sinh_vien_id' => $bangDiem->sinh_vien_id,
            'lop_hoc_phan_id' => $bangDiem->lop_hoc_phan_id,
            'trang_thai' => 'cho_xu_ly',
            'noi_dung' => $data['noi_dung'],
            'diem_cu' => $bangDiem->diem_tong_ket,
            'ngay_gui' => now(),
        ]);

        return $this->responseCreated($phucKhao->fresh(['bangDiem', 'lopHocPhan.monHoc']));
    }

    public function resolve(Request $request, $id)
    {
        $phucKhao = PhucKhao::with('bangDiem.lopHocPhan.hocKy', 'bangDiem.lopHocPhan.monHoc', 'lopHocPhan')->findOrFail($id);
        $this->authorizeResolve($request, $phucKhao);

        $data = $request->validate([
            'trang_thai' => 'required|string|in:chap_nhan,tu_choi',
            'diem_moi' => 'nullable|numeric|min:0|max:10',
            'ket_qua_xu_ly' => 'nullable|string',
        ]);

        abort_if($data['trang_thai'] === 'chap_nhan' && !isset($data['diem_moi']), 422, 'Can nhap diem moi khi chap nhan phuc khao.');

        $phucKhao = DB::transaction(function () use ($phucKhao, $data, $request) {
            $bangDiem = $phucKhao->bangDiem;
            $before = $bangDiem->only(['diem_tong_ket', 'ket_qua']);

            if ($data['trang_thai'] === 'chap_nhan') {
                $bangDiem->update([
                    'diem_tong_ket' => $data['diem_moi'],
                    'ket_qua' => $this->resolveResult($bangDiem, ['diem_tong_ket' => $data['diem_moi']]),
                    'nguoi_cham_id' => optional($request->user()->giaoVien)->id,
                    'ngay_cham' => now(),
                ]);

                LichSuChamDiem::create([
                    'bang_diem_id' => $bangDiem->id,
                    'nguoi_cham_id' => optional($request->user()->giaoVien)->id,
                    'loai_cham' => 'phuc_khao',
                    'diem_truoc' => $before,
                    'diem_sau' => $bangDiem->only(['diem_tong_ket', 'ket_qua']),
                    'ly_do' => $data['ket_qua_xu_ly'] ?? null,
                ]);
            }

            $phucKhao->update([
                'trang_thai' => $data['trang_thai'],
                'diem_moi' => $data['diem_moi'] ?? null,
                'giao_vien_xu_ly_id' => optional($request->user()->giaoVien)->id,
                'ngay_xu_ly' => now(),
                'ket_qua_xu_ly' => $data['ket_qua_xu_ly'] ?? null,
            ]);

            return $phucKhao->fresh(['bangDiem', 'lopHocPhan.monHoc', 'giaoVienXuLy']);
        });

        return $this->responseUpdated($phucKhao);
    }

    private function authorizeResolve(Request $request, PhucKhao $phucKhao): void
    {
        $user = $request->user();

        if ($user->vai_tro === RoleCode::ADMIN) {
            return;
        }

        if ($user->isTeacher() && $phucKhao->lopHocPhan->giao_vien_bo_mon_id === optional($user->giaoVien)->id) {
            return;
        }

        abort(403, 'Khong co quyen xu ly phuc khao nay.');
    }

    private function currentStudentId(Request $request): int
    {
        $studentId = optional($request->user()->sinhVien)->id;
        abort_unless($studentId, 403, 'Khong tim thay ho so sinh vien cua tai khoan nay.');

        return $studentId;
    }

    private function resolveResult(BangDiem $bangDiem, array $overrides = []): string
    {
        $score = function (string $field) use ($bangDiem, $overrides) {
            return array_key_exists($field, $overrides) ? $overrides[$field] : $bangDiem->{$field};
        };

        $diemTongKet = $score('diem_tong_ket');

        if ($diemTongKet === null) {
            return 'chua_co_diem';
        }

        $diemQuaMon = $bangDiem->lopHocPhan->monHoc->diem_qua_mon
            ?? $bangDiem->lopHocPhan->hocKy->diem_qua_mon_mac_dinh
            ?? 4;

        foreach (['diem_chuyen_can', 'diem_giua_ky', 'diem_cuoi_ky', 'diem_tong_ket'] as $field) {
            $currentScore = $score($field);

            if ($currentScore !== null && (float) $currentScore < (float) $diemQuaMon) {
                return 'truot';
            }
        }

        return 'qua_mon';
    }
}
