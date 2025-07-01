<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CauHoi;
use App\Models\DeThi;
use App\Models\ChiTietDeThi;
use App\Models\MonHoc;

class DeThiController extends Controller
{
    public function index(Request $request)
    {
        $query = DeThi::query()->where('mon_hoc_id', $request->get('mon_hoc_id'));
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedSearch(["code"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $cau_hois = $data['cau_hoi'] ?? [];
        $dethi = DeThi::create([
            'mon_hoc_id' => $data['mon_hoc_id'],
            'thoi_gian_thi' => $data['thoi_gian'],
            'ghi_chu' => $data['ghi_chu'] ?? null,
            'nguoi_tao_id' => auth()->user()->id,
            'tong_so_cau_hoi' => count($cau_hois),
            'diem_toi_da' => $data['diem_toi_da'] ?? 0,
            'diem_dat' => $data['diem_dat'] ?? 0,
            'code' => now()->format('Ymd') . str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT),
        ]);
        foreach ($cau_hois as $cau_hoi) {
            $cauhoi = ChiTietDeThi::create([
                'de_thi_id' => $dethi->id,
                'cau_hoi_id' => $cau_hoi['id'],
                'diem' => round(10 / count($cau_hois),2) ?? 0,
                'ghi_chu' => $cau_hoi['ghi_chu'] ?? null,
            ]);
        }

        return $this->responseSuccess([
            'message' => 'Đề thi đã được tạo thành công',
            'data' => $dethi
        ]);
    }

    public function show($id)
    {
        $dethi = DeThi::with(['chiTietDeThis', 'monHoc'])->find($id);
        if (!$dethi) {
            return response()->json(['message' => 'Đề thi không tồn tại'], 404);
        }
        return $this->responseSuccess($dethi);
    }

    public function update(Request $request, $id)
    {
        $dethi = DeThi::find($id);
        if (!$dethi) {
            return response()->json(['message' => 'Đề thi không tồn tại'], 404);
        }

        $data = $request->all();
        $cau_hois = $data['cau_hoi'] ?? [];
        $dethi->update([
            'mon_hoc_id' => $data['mon_hoc_id'],
            'thoi_gian_thi' => $data['thoi_gian'],
            'ghi_chu' => $data['ghi_chu'] ?? null,
            'tong_so_cau_hoi' => count($cau_hois),
            'diem_toi_da' => $data['diem_toi_da'] ?? 0,
            'diem_dat' => $data['diem_dat'] ?? 0,
        ]);

        ChiTietDeThi::where('de_thi_id', $dethi->id)->delete();
        foreach ($cau_hois as $cau_hoi) {
            ChiTietDeThi::create([
                'de_thi_id' => $dethi->id,
                'cau_hoi_id' => $cau_hoi['id'],
                'diem' => round(10 / count($cau_hois),2) ?? 0,
                'ghi_chu' => $cau_hoi['ghi_chu'] ?? null,
            ]);
        }

        return $this->responseSuccess([
            'message' => 'Đề thi đã được cập nhật thành công',
            'data' => $dethi
        ]);
    }

    public function destroy($id)
    {
        $dethi = DeThi::find($id);
        if (!$dethi) {
            return response()->json(['message' => 'Đề thi không tồn tại'], 404);
        }

        ChiTietDeThi::where('de_thi_id', $dethi->id)->delete();
        $dethi->delete();

        return $this->responseSuccess(['message' => 'Đề thi đã được xóa thành công']);
    }

    public function getDeThiRandom(Request $request, $id)
    {
        $mon = MonHoc::find($id);
        $level = $mon->level();
        $deThi = DeThi::where('diem_toi_da', $level)
    ->with([
        'monHoc',
        'nguoiTao',
        'chiTietDeThis.cauHoi' => function ($query) {
            $query->select('id', 'de_bai');
        }
    ])
    ->inRandomOrder()
    ->first();
        return $this->responseSuccess($deThi);

    }
}
