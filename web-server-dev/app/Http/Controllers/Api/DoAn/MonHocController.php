<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\MonHoc;
use Illuminate\Support\Facades\DB;

class MonHocController extends Controller
{
    public function index(Request $request)
    {
        $query = MonHoc::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedSearch(["ten_mon_hoc", "ten_mon_hoc"])
            ->allowedPagination();
        $data = $query->paginate();
        $data->getCollection()->transform(function ($item) {
            $item['so_cau_hoi'] = $item->soCau();
            return $item;
        });
        return response()->json(new \App\Http\Resources\Items($data), 200, []);
    }


    public function create()
    {
        $tao_monHoc = [
            'monHocList' => MonHoc::all()
        ];

        return response()->json($tao_monHoc);
    }


    public function store(Request $request)
    {
        $request->validate([
            'ten_mon_hoc' => 'required|string|max:255',
        ]);

        try {
            DB::table('mon_hoc')->insert([
                'ten_mon_hoc' => $request->ten_mon_hoc,
                'created_at' => now(),
                'updated_at' => null
            ]);

            return response()->json([
                'message' => 'Tạo môn học thành công'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function show($id)
    {
        $monHoc = MonHoc::find($id);
        if (!$monHoc) {
            return response()->json([
                'error' => 'Không tìm thấy môn học'
            ], 404); // HTTP 404 Not Found
        }

        return response()->json([
            'data' => $monHoc
        ], 200);
    }

    public function update(Request $request, $mon_hoc_id)
    {
        $request->validate([
            'ten_mon_hoc' => 'required|string|max:255',
        ]);

        try {
            // Bắt đầu transaction
            DB::beginTransaction();

            // Cập nhật môn học
            $updated = DB::table('mon_hoc')->where('mon_hoc_id', $mon_hoc_id)->update([
                'ten_mon_hoc' => $request->ten_mon_hoc,
            ]);

            DB::commit();

            if ($updated) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Cập nhật môn học thành công',
                ], 200);
            } else {
                // Không tìm thấy hoặc không cập nhật được
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy môn học hoặc không có thay đổi nào được thực hiện',
                ], 404);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($mon_hoc_id)
    {
        DB::beginTransaction();

        try {
            // Xóa môn học
            $deleted = DB::table('mon_hoc')->where('mon_hoc_id', $mon_hoc_id)->delete();

            DB::commit();

            if ($deleted) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Đã xóa môn học thành công',
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy môn học cần xóa',
                ], 404);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getLevel($id)
    {
        $mon = MonHoc::find($id);
        $mon['level'] = $mon->level();
        return $this->responseSuccess($mon);
    }
}
