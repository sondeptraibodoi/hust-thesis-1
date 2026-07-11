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
            $query->where('sinh_vien_id', optional($user->sinhVien)->id);
        }

        if ($user->isTeacher() && $user->vai_tro !== RoleCode::HOMEROOM_TEACHER) {
            $query->whereHas('lopHocPhan', function ($q) use ($user) {
                $q->where('giao_vien_bo_mon_id', optional($user->giaoVien)->id);
            });
        }

        if ($user->vai_tro === RoleCode::HOMEROOM_TEACHER) {
            $query->whereHas('sinhVien.lopHanhChinh', function ($q) use ($user) {
                $q->where('giao_vien_chu_nhiem_id', optional($user->giaoVien)->id);
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        return $this->responseSuccess($query->latest()->paginate($request->get('per_page', 20)));
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
        abort_unless($bangDiem->lopHocPhan->hocKy->dang_mo_phuc_khao, 422, 'Hoc ky chua mo phuc khao.');

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
                    'ket_qua' => $this->resolveResult($bangDiem, $data['diem_moi']),
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
