<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\HocKy;
use Illuminate\Http\Request;

class HocKyController extends Controller
{
    public function index(Request $request)
    {
        $query = HocKy::query()->orderByDesc('nam_hoc')->orderByDesc('hoc_ky_so');

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        return $this->responseSuccess($query->paginate($request->get('per_page', 20)));
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'ma_hoc_ky' => 'required|string|max:255|unique:hoc_kies,ma_hoc_ky',
            'ten_hoc_ky' => 'required|string|max:255',
            'nam_hoc' => 'required|string|max:255',
            'hoc_ky_so' => 'required|integer|min:1|max:3',
            'ngay_bat_dau' => 'nullable|date',
            'ngay_ket_thuc' => 'nullable|date|after_or_equal:ngay_bat_dau',
            'dang_mo_dang_ky' => 'boolean',
            'dang_mo_phuc_khao' => 'boolean',
            'diem_qua_mon_mac_dinh' => 'numeric|min:0|max:10',
            'trang_thai' => 'string|max:32',
        ]);

        return $this->responseCreated(HocKy::create($data));
    }

    public function update(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $hocKy = HocKy::findOrFail($id);
        $data = $request->validate([
            'ma_hoc_ky' => 'sometimes|required|string|max:255|unique:hoc_kies,ma_hoc_ky,' . $id,
            'ten_hoc_ky' => 'sometimes|required|string|max:255',
            'nam_hoc' => 'sometimes|required|string|max:255',
            'hoc_ky_so' => 'sometimes|required|integer|min:1|max:3',
            'ngay_bat_dau' => 'nullable|date',
            'ngay_ket_thuc' => 'nullable|date|after_or_equal:ngay_bat_dau',
            'dang_mo_dang_ky' => 'boolean',
            'dang_mo_phuc_khao' => 'boolean',
            'diem_qua_mon_mac_dinh' => 'numeric|min:0|max:10',
            'trang_thai' => 'string|max:32',
        ]);

        $hocKy->update($data);

        return $this->responseUpdated($hocKy->fresh());
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureAdmin($request);

        HocKy::findOrFail($id)->delete();

        return $this->responseDeleted();
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()->vai_tro === RoleCode::ADMIN, 403, 'Khong co quyen thuc hien thao tac nay.');
    }
}
