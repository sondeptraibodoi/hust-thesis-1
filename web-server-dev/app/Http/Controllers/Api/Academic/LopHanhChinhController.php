<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\LopHanhChinh;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LopHanhChinhController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LopHanhChinh::query()->with(['giaoVienChuNhiem']);

        if ($user->isTeacher()) {
            $query->where('giao_vien_chu_nhiem_id', optional($user->giaoVien)->id);
        } elseif ($user->vai_tro !== RoleCode::ADMIN) {
            abort(403, 'Khong co quyen xem lop hanh chinh.');
        }

        return $this->responseSuccess($query->paginate($this->perPage($request)));
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'ma_lop' => 'required|string|max:255|unique:lop_hanh_chinhs,ma_lop',
            'ten_lop' => 'required|string|max:255',
            'khoa' => 'nullable|string|max:255',
            'nganh' => 'nullable|string|max:255',
            'giao_vien_chu_nhiem_id' => 'nullable|exists:giao_viens,id',
        ]);

        $this->ensureUniqueHomeroomTeacher($data['giao_vien_chu_nhiem_id'] ?? null, null);

        return $this->responseCreated(LopHanhChinh::create($data));
    }

    public function update(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $lop = LopHanhChinh::findOrFail($id);
        $data = $request->validate([
            'ma_lop' => 'sometimes|required|string|max:255|unique:lop_hanh_chinhs,ma_lop,' . $id,
            'ten_lop' => 'sometimes|required|string|max:255',
            'khoa' => 'nullable|string|max:255',
            'nganh' => 'nullable|string|max:255',
            'giao_vien_chu_nhiem_id' => 'nullable|exists:giao_viens,id',
        ]);

        $targetTeacherId = array_key_exists('giao_vien_chu_nhiem_id', $data)
            ? $data['giao_vien_chu_nhiem_id']
            : $lop->giao_vien_chu_nhiem_id;

        $this->ensureUniqueHomeroomTeacher($targetTeacherId, $lop->id);

        $lop->update($data);

        return $this->responseUpdated($lop->fresh(['giaoVienChuNhiem']));
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureAdmin($request);

        LopHanhChinh::findOrFail($id)->delete();

        return $this->responseDeleted();
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()->vai_tro === RoleCode::ADMIN, 403, 'Khong co quyen thuc hien thao tac nay.');
    }

    private function ensureUniqueHomeroomTeacher(?int $teacherId, ?int $exceptId): void
    {
        if (!$teacherId) {
            return;
        }

        $exists = LopHanhChinh::query()
            ->where('giao_vien_chu_nhiem_id', $teacherId)
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'giao_vien_chu_nhiem_id' => ['Giao vien nay dang chu nhiem mot lop khac.'],
            ]);
        }
    }
}
