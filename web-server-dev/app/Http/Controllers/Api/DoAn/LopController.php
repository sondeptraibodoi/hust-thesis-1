<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\DeThiLop;
use App\Models\GiaoVienLop;
use App\Models\LopThi;
use App\Models\SinhVienLop;
use Illuminate\Http\Request;

class LopController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LopThi::query()->with(['monHoc']);
        if($user->vai_tro === RoleCode::TEACHER) {
            $query->whereHas('giaoViens', function ($q) use ($user) {
                $q->where('giao_vien_id', $user->giaoVien->id);
            });
        }
        if($user->vai_tro === RoleCode::STUDENT) {
            $query->whereHas('sinhViens', function ($q) use ($user) {
                $q->where('sinh_vien_id', $user->sinhVien->id);
            });
        }
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedFilters(['mon_hoc_id'])
            ->allowedSearch(["ten_lop", "hoc_ky", 'nam_hoc'])
            ->allowedPagination();
        $data = $query->paginate();
        return response()->json(new \App\Http\Resources\Items($data), 200, []);
    }

    public function store(Request $request)
    {
        $query = $request->all();
        LopThi::create($query);
        return $this->responseSuccess();
    }

    public function update(Request $request, $id)
    {
        $query = $request->all();
        $lop = LopThi::find($id);
        $lop->update($query);
        return $this->responseSuccess();
    }

    public function destroy($id)
    {
        $lop = LopThi::find($id);
        $lop->delete();
        return $this->responseSuccess();
    }

    public function phanCongLop(Request $request, $id)
    {
        $query = $request->all();
        $sinhViens = $query['sinh_vien'];
        $giaoViens = $query['giao_vien'];
        $deThis = $query['de_thi'];
        $submittedSinhVienIds = collect($sinhViens)->pluck('id')->toArray();
        SinhVienLop::where('lop_thi_id', $id)
            ->whereNotIn('sinh_vien_id', $submittedSinhVienIds)
            ->delete();

        foreach ($submittedSinhVienIds as $sinhVienId) {
            SinhVienLop::updateOrCreate(
                ['lop_thi_id' => $id, 'sinh_vien_id' => $sinhVienId],
                []
            );
        }
        $submittedGiaoVienIds = collect($giaoViens)->pluck('id')->toArray();

        GiaoVienLop::where('lop_thi_id', $id)
            ->whereNotIn('giao_vien_id', $submittedGiaoVienIds)
            ->delete();

        foreach ($submittedGiaoVienIds as $giaoVienId) {
            GiaoVienLop::updateOrCreate(
                ['lop_thi_id' => $id, 'giao_vien_id' => $giaoVienId],
                ['vai_tro' => $item['role'] ?? 'giang-day',]
            );
        }
        $submittedDeThiKeys = collect($deThis)->map(function ($item) {
            return [
                'de_thi_id' => $item['id'],
                'loai_thi_id' => $item['loai_thi_id'],
                'level' => $item['do_kho'],
            ];
        });
        DeThiLop::where('lop_thi_id', $id)
            ->whereNotIn('de_thi_id', $submittedDeThiKeys->pluck('de_thi_id'))
            ->delete();

        foreach ($submittedDeThiKeys as $item) {
            DeThiLop::updateOrCreate(
                ['lop_thi_id' => $id, 'de_thi_id' => $item['de_thi_id']],
                [
                    'loai_thi_id' => $item['loai_thi_id'],
                    'level' => $item['level'],
                ]
            );
        }

        return response()->json(['message' => 'Phân công lớp thành công']);
    }

    public function show($id)
    {
        // Sinh viên
        $sinhViens = SinhVienLop::with('sinhVien') // Assuming relation 'sinhVien' exists
            ->where('lop_thi_id', $id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->sinh_vien_id,
                    'mssv' => $item->sinhVien->mssv,
                    'ho_ten' => $item->sinhVien->ho_ten,
                    'email' => $item->sinhVien->email,
                ];
            });

        // Giáo viên
        $giaoViens = GiaoVienLop::with('giaoVien') // Assuming relation 'giaoVien' exists
            ->where('lop_thi_id', $id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->giao_vien_id,
                    'ho_ten' => $item->giaoVien->ho_ten,
                    'email' => $item->giaoVien->email,
                ];
            });

        // Đề thi
        $deThis = DeThiLop::with('deThi', 'loaiThi') // Assuming relation exists
            ->where('lop_thi_id', $id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->de_thi_id,
                    'code' => $item->deThi->code ?? null,
                    'loai_thi_id' => $item->loai_thi_id,
                    'loai_thi' => $item->loaiThi ?? null,
                    'do_kho' => $item->level
                ];
            });

        return response()->json([
            'sinh_vien' => $sinhViens,
            'giao_vien' => $giaoViens,
            'de_thi' => $deThis,
        ]);
    }
}
