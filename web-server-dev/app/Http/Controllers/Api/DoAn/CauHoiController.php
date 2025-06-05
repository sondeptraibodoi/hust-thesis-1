<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\MonHoc;
use App\Models\CauHoi;
use Illuminate\Support\Facades\DB;

class CauHoiController extends Controller
{
    public function index()
    {
        $cauHoiList = CauHoi::with('monHoc')->get(); // nếu có quan hệ
        return response()->json([
            'status' => 'success',
            'data' => $cauHoiList
        ]);
    }

    public function create()
    {
        $monHocList = MonHoc::all();
        return response()->json([
            'status' => 'success',
            'data' => $monHocList
        ]);
    }


    // public function store(Request $request)
    // {

    //     $noi_dung_cau_hoi = $request->noi_dung;
    //     $do_kho = $request->do_kho;
    //     $mon_hoc_id = $request->mon_hoc_id;
    //     $noi_dung_dap_an = $request->noi_dung_dap_an;
    //     $dap_an_dung = $request->dap_an_dung;

    //     DB::table('cau_hoi')->insert([
    //         'noi_dung' => $noi_dung_cau_hoi,
    //         'do_kho' => $do_kho,
    //         'mon_hoc_id' => $mon_hoc_id,
    //         'created_at' => now(),
    //         'updated_at' => NULL
    //     ]);

    //     DB::table('dap_an')->insert([
    //         'noi_dung' => $noi_dung_dap_an,
    //         'la_dap_an_dung' => $dap_an_dung,
    //     ]);

    //     return redirect()->route('admin.cauhoi.index')->with('success', 'Tạo câu hỏi thành công');
    // }

    public function store(Request $request)
    {
        $request->validate([
            'noi_dung' => 'required',
            'do_kho' => 'required|integer',
            'mon_hoc_id' => 'required|integer',
            'dap_an.*.noi_dung' => 'required',
            'dap_an_dung' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $cauHoiId = DB::table('cau_hoi')->insertGetId([
                'noi_dung' => $request->noi_dung,
                'do_kho' => $request->do_kho,
                'mon_hoc_id' => $request->mon_hoc_id,
                'created_at' => now(),
                'updated_at' => null
            ]);

            foreach ($request->dap_an as $index => $dapAn) {
                DB::table('dap_an')->insert([
                    'noi_dung' => $dapAn['noi_dung'],
                    'la_dap_an_dung' => ($index == $request->dap_an_dung) ? 1 : 0,
                    'cau_hoi_id' => $cauHoiId
                ]);
            }

            DB::commit();
            return $this->responseCreated(['cau_hoi_id' => $cauHoiId], 'Tạo câu hỏi thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->responseError('Có lỗi xảy ra', 500, ['error' => $e->getMessage()]);
        }
    }

    public function edit($cau_hoi_id)
    {
        // Lấy câu hỏi
        $cauHoi = DB::table('cau_hoi')->where('cau_hoi_id', $cau_hoi_id)->first();
        if (!$cauHoi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy câu hỏi'
            ], 404);
        }

        // Lấy danh sách đáp án
        $dapAnList = DB::table('dap_an')
                        ->where('cau_hoi_id', $cau_hoi_id)
                        ->orderBy('thu_tu')
                        ->get();

        // Lấy danh sách môn học
        $monHocList = DB::table('mon_hoc')->get();

        // Trả JSON về frontend
        return response()->json([
            'status' => 'success',
            'data' => [
                'cau_hoi' => $cauHoi,
                'dap_an_list' => $dapAnList,
                'mon_hoc_list' => $monHocList,
            ]
        ]);
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
        DB::beginTransaction();

        try {
            // Xóa các đáp án liên quan
            DB::table('dap_an')->where('cau_hoi_id', $id)->delete();

            // Xóa câu hỏi
            DB::table('cau_hoi')->where('cau_hoi_id', $id)->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Đã xóa câu hỏi thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa: ' . $e->getMessage()
            ], 500);
        }
    }

}
