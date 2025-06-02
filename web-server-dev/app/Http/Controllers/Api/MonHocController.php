<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\MonHoc;
use Illuminate\Support\Facades\DB;

class MonHocController extends Controller
{
    public function index () {
        if (!Auth::check()) {
            return redirect('/hustLmao/sinhvien/login');
        }
        $cauHoiList = MonHoc::all(); // Nếu có chọn môn học khi tạo
        return view ("admin.cau-hoi.index", compact('cauHoiList'));
    }


    public function create() {
        return view('admin.mon-hoc.create', compact('monHocList'));
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'ten_mon_hoc' => 'required|string|max:255',
        ]);

        try {
            DB::table('mon_hoc')->insert([
                'ten_mon_hoc' => $request->ten_mon,
                'created_at' => now()
            ]);

            return redirect()->route('admin.mon-hoc.index')->with('success', 'Tạo môn học thành công');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()]);
        }
    }


    public function edit($mon_hoc_id)
    {
        // Lấy câu hỏi theo ID
        $monHoc = DB::table('mon-hoc')->where('mon_hoc_id', $mon_hoc_id)->first();

        // Trả về view
        return view('admin.mon-hoc.edit', compact('monHoc'));
    }

    public function update(Request $request, $mon_hoc_id) {
        $request->validate([
            'ten_mon_hoc' => 'required|string|max:255',
        ]);

         try {
            // Cập nhật câu hỏi
            DB::table('mon_hoc')->where('mon_hoc_id', $mon_hoc_id)->update([
                'ten_mon_hoc' => $request->ten_mon_hoc
            ]);

            DB::commit();
            return redirect()->route('admin.mon-hoc.index')->with('success', 'Cập nhật câu hỏi thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors('Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function destroy($mon_hoc_id) {
        DB::beginTransaction();

        try {
            // Xóa đáp án liên quan trước (nếu có quan hệ ràng buộc)
            DB::table('mon-hoc')->where('mon_hoc_id', $mon_hoc_id)->delete();

            DB::commit();
            return redirect()->route('admin.mon-hoc.index')->with('success', 'Đã xóa môn học thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors('Lỗi khi xóa: ' . $e->getMessage());
        }
    }

}
