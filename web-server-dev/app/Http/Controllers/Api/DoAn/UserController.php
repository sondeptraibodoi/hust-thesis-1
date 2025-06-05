<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\NguoiDung;

class UserController extends Controller
{
    // Danh sách người dùng
    public function index()
    {
        $nguoiDungList = NguoiDung::all();
        return response()->json(['data' => $nguoiDungList], 200);
    }

    // Thêm người dùng
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_dang_nhap' => 'required|string|unique:nguoi_dung',
            'password' => 'required|string|min:6',
            'ho_ten' => 'required|string',
            'email' => 'required|string'
        ]);

        $nguoiDung = NguoiDung::create([
            'ho_ten' => $validated['ho_ten'],
            'ten_dang_nhap' => $validated['ten_dang_nhap'],
            'password' => Hash::make($validated['password']),
            'email' => $validated['email'],
            'vai_tro' => 'admin',
        ]);

        return response()->json(['data' => $nguoiDung], 201);
    }

    // Chi tiết người dùng
    public function show($id)
    {
        $nguoiDung = NguoiDung::find($id);
        if (!$nguoiDung) {
            return response()->json(['error' => 'Không tìm thấy người dùng'], 404);
        }
        return response()->json(['data' => $nguoiDung], 200);
    }

    // Cập nhật người dùng
    public function update(Request $request, $id)
    {
        $nguoiDung = NguoiDung::find($id);
        if (!$nguoiDung) {
            return response()->json(['error' => 'Không tìm thấy người dùng'], 404);
        }

        $request->validate([
            'ho_ten' => 'sometimes|required|string',
            'password' => 'sometimes|required|string|min:6',
            'vai_tro' => 'sometimes|required|in:sinh_vien,admin,super_admin',
        ]);

        if ($request->has('ho_ten')) {
            $nguoiDung->ho_ten = $request->ho_ten;
        }

        if ($request->has('password')) {
            $nguoiDung->password = Hash::make($request->password);
        }

        if ($request->has('vai_tro')) {
            $nguoiDung->vai_tro = $request->vai_tro;
        }

        $nguoiDung->save();

        return response()->json(['data' => $nguoiDung], 200);
    }

    public function destroy($id)
    {
        $nguoiDung = NguoiDung::find($id);
        if (!$nguoiDung) {
            return response()->json(['error' => 'Không tìm thấy người dùng'], 404);
        }

        $nguoiDung->delete();
        return response()->json(['message' => 'Đã xóa người dùng'], 200);
    }

    public function indexSinhVien()
    {
        $sinhVienList = NguoiDung::where('vai_tro', 'sinh_vien')->get(); 
        return response()->json($sinhVienList);
    }

    public function storeSinhVien(Request $request)
    {
        $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'mat_khau' => 'required|string|min:6',
        ]);

        $sinhVien = NguoiDung::create([
            'ten' => $request->ten,
            'email' => $request->email,
            'mat_khau' => bcrypt($request->mat_khau),
            'vai_tro' => 'sinh_vien',
        ]);

        return response()->json($sinhVien, 201);
    }

    public function showSinhVien($id)
    {
        $sinhVien = NguoiDung::where('vai_tro', 'sinh_vien')->findOrFail($id);
        return response()->json($sinhVien);
    }

    public function updateSinhVien(Request $request, $id)
    {
        $sinhVien = NguoiDung::where('vai_tro', 'sinh_vien')->findOrFail($id);

        $request->validate([
            'ten' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:nguoi_dung,email,' . $id . ',nguoi_dung_id',
            // Nếu muốn update mật khẩu: 'mat_khau' => 'nullable|string|min:6',
        ]);

        $sinhVien->update($request->only(['ten', 'email']));

        return response()->json($sinhVien);
    }

    public function destroySinhVien($id)
    {
        $sinhVien = NguoiDung::where('vai_tro', 'sinh_vien')->findOrFail($id);
        $sinhVien->delete();

        return response()->json(['message' => 'Xóa sinh viên thành công']);
    }

}
