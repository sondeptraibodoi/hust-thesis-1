<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\MonHoc;
use App\Models\CauHoi;
use Illuminate\Support\Facades\DB;

class CauHoiController extends Controller
{
    public function index() {
        if (!Auth::check()) {
            return redirect('/hustLmao/sinhvien/login');
        }
        $cauHoiList = CauHoi::all(); // Nếu có chọn môn học khi tạo
        return view ("admin.cauhoi.index", compact('cauHoiList'));
    }

    public function create()
    {
        $monHocList = MonHoc::all(); 
        return view('admin.cauhoi.create', compact('monHocList'));
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
            // Thêm câu hỏi
            $cauHoiId = DB::table('cau_hoi')->insertGetId([
                'noi_dung' => $request->noi_dung,
                'do_kho' => $request->do_kho,
                'mon_hoc_id' => $request->mon_hoc_id,
                'created_at' => now(),
                'updated_at' => null
            ]);

            // Thêm các đáp án
            foreach ($request->dap_an as $index => $dapAn) {
                DB::table('dap_an')->insert([
                    'noi_dung' => $dapAn['noi_dung'],
                    'la_dap_an_dung' => ($index == $request->dap_an_dung) ? 1 : 0,
                    'cau_hoi_id' => $cauHoiId
                ]);
            }

            DB::commit();
            return redirect()->route('admin.cauhoi.index')->with('success', 'Tạo câu hỏi thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors('Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function edit($cau_hoi_id)
    {
        // Lấy câu hỏi theo ID
        $cauHoi = DB::table('cau_hoi')->where('cau_hoi_id', $cau_hoi_id)->first();

        // Lấy danh sách đáp án theo câu hỏi
        $dapAnList = DB::table('dap_an')
                        ->where('cau_hoi_id', $cau_hoi_id)
                        ->orderBy('thu_tu')
                        ->get();

        // Lấy danh sách môn học
        $monHocList = DB::table('mon_hoc')->get();

        // Trả về view
        return view('admin.cauhoi.edit', compact('cauHoi', 'dapAnList', 'monHocList'));
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

            // Cập nhật các đáp án
            foreach ($request->dap_an as $index => $dapAn) {
                DB::table('dap_an')->where('dap_an_id', $dapAn['dap_an_id'])->update([
                    'noi_dung' => $dapAn['noi_dung'],
                    'la_dap_an_dung' => ($index == $request->dap_an_dung) ? 1 : 0,
                    'thu_tu' => $index
                ]);
            }

            DB::commit();
            return redirect()->route('admin.cauhoi.index')->with('success', 'Cập nhật câu hỏi thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors('Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            // Xóa đáp án liên quan trước (nếu có quan hệ ràng buộc)
            DB::table('dap_an')->where('cau_hoi_id', $id)->delete();

            // Xóa câu hỏi
            DB::table('cau_hoi')->where('cau_hoi_id', $id)->delete();

            DB::commit();
            return redirect()->route('admin.cauhoi.index')->with('success', 'Đã xóa câu hỏi thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors('Lỗi khi xóa: ' . $e->getMessage());
        }
    }

}
