<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CauHoi;
use App\Models\DapAn;
use Illuminate\Support\Facades\DB;

class CauHoiController extends Controller
{
    public function index(Request $request)
    {
        $query = CauHoi::query()->with(['dapAns'])->where('mon_hoc_id', $request->get('mon_hoc_id'));
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("-id")
            ->allowedSearch(["do_kho", "de_bai", 'dap_an', 'loai'])
            ->allowedFilters(["do_kho", "de_bai", 'dap_an', 'loai'])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $cau_hoi = CauHoi::create(array_merge($data));
        foreach (['a', 'b', 'c', 'd'] as $name) {
            DapAn::create([
                'name' => $name,
                'cau_hoi_id' => $cau_hoi->id,
                'context' => $data[$name] ?? '',
            ]);
        }

        return $this->responseSuccess();
    }

    public function edit(Request $request, $id)
    {
        $cau_hoi = CauHoi::find($id);
        $data = $request->all();
        $cau_hoi->update(array_merge($data));
        if ($request->has('dap_ans') && is_array($request->dap_ans)) {
            foreach ($request->dap_ans as $dapAnData) {
                $name = $dapAnData['name'];
                $context = $request->input($name);
                if (!empty($context)) {
                    $dapan = DapAn::where('id', $dapAnData['id'])->first();
                    $dapan->update([
                        'context' => $context,
                    ]);
                }
            }
        }
        return $this->responseSuccess($cau_hoi);
    }

    public function update(Request $request, $cau_hoi_id)
    {
        $request->validate([
            'noi_dung' => 'required',
            'do_kho' => 'required|integer',
            'mon_hoc_id' => 'required|integer',
            'dap_an.*.noi_dung' => 'required',
            'dap_an.*.dap_an_id' => 'required|integer',
            'dap_an_dung' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            // Cập nhật câu hỏi
            DB::table('cau_hoi')->where('cau_hoi_id', $cau_hoi_id)->update([
                'noi_dung' => $request->noi_dung,
                'do_kho' => $request->do_kho,
                'mon_hoc_id' => $request->mon_hoc_id,
                'updated_at' => now()
            ]);

            // Cập nhật từng đáp án
            foreach ($request->dap_an as $index => $dapAn) {
                DB::table('dap_an')->where('dap_an_id', $dapAn['dap_an_id'])->update([
                    'noi_dung' => $dapAn['noi_dung'],
                    'la_dap_an_dung' => ($index == $request->dap_an_dung) ? 1 : 0,
                    'thu_tu' => $index
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật câu hỏi thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $cau_hoi = CauHoi::find($id);
        $cau_hoi->delete();
        return $this->responseSuccess();
    }
}
