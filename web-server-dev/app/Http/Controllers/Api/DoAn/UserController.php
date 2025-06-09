<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\NguoiDung;
use Illuminate\Validation\Rules\Password;

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

    //Xóa người dùng
    public function destroy($id)
    {
        $nguoiDung = NguoiDung::find($id);
        if (!$nguoiDung) {
            return response()->json(['error' => 'Không tìm thấy người dùng'], 404);
        }

        $nguoiDung->delete();
        return response()->json(['message' => 'Đã xóa người dùng'], 200);
    }

    //Danh sách sinh viên
    public function indexSinhVien()
    {
        $sinhVienList = NguoiDung::where('vai_tro', 'sinh_vien')->get(); 
        return response()->json($sinhVienList);
    }

    //Thêm sinh viên
    public function storeSinhVien(Request $request)
    {
        $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'password' => 'required|string|min:6',
        ]);

        $sinhVien = NguoiDung::create([
            'ten' => $request->ten,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'vai_tro' => 'sinh_vien',
        ]);

        return response()->json($sinhVien, 201);
    }

    // Xem thông tin sinh viên
    public function showSinhVien($id)
    {
        $sinhVien = NguoiDung::where('vai_tro', 'sinh_vien')->findOrFail($id);
        return response()->json($sinhVien);
    }

    //Cập nhật thông tin sinh viên
    public function updateSinhVien(Request $request, $id)
    {
        $sinhVien = NguoiDung::where('vai_tro', 'sinh_vien')->findOrFail($id);

        $request->validate([
            'ten' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:nguoi_dung,email,' . $id . ',nguoi_dung_id',
            // Nếu muốn update mật khẩu: 'password' => 'nullable|string|min:6',
        ]);

        $sinhVien->update($request->only(['ten', 'email']));

        return response()->json($sinhVien);
    }

    //Xóa sinh viên
    public function destroySinhVien($id)
    {
        $sinhVien = NguoiDung::where('vai_tro', 'sinh_vien')->findOrFail($id);
        $sinhVien->delete();

        return response()->json(['message' => 'Xóa sinh viên thành công']);
    }


    //Đổi mật khẩu (Đối với người dùng đã đăng nhập)
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required'],
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ]);

        /** @var NguoiDung $user */
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng.'], 403);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Đổi mật khẩu thành công.']);
    }

}
