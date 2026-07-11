<?php

namespace App\Http\Controllers\Api\Academic;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Models\CauHinhHeThong;
use Illuminate\Http\Request;

class CauHinhHeThongController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $query = CauHinhHeThong::query()->orderBy('group')->orderBy('key');

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        return $this->responseSuccess($query->get());
    }

    public function upsert(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'nullable|array',
            'group' => 'nullable|string|max:255',
            'mo_ta' => 'nullable|string',
        ]);

        $config = CauHinhHeThong::updateOrCreate(
            ['key' => $data['key']],
            [
                'value' => $data['value'] ?? null,
                'group' => $data['group'] ?? 'academic',
                'mo_ta' => $data['mo_ta'] ?? null,
                'updated_by' => $request->user()->id,
            ]
        );

        return $this->responseUpdated($config);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()->vai_tro === RoleCode::ADMIN, 403, 'Khong co quyen thuc hien thao tac nay.');
    }
}
