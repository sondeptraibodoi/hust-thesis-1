<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Auth\User;
use App\Models\GiaoVien;
use App\Models\SinhVien;
use Illuminate\Http\Request;

class AdminSinhVienController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([
                'vai_tro',
                'email'
            ], [], [
                'vai_tro' => function ($filter, $query) {
                    $query->where('vai_tro', $filter['value'] ?? null);
                },
                'trang_thai' => function ($filter, $query) {
                    $query->where('trang_thai', $filter['value'] ?? null);
                },
            ])
            ->defaultSort("id")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $request->validate([
        'email' => 'required|email|unique:nguoi_dungs,email',
        'ho_ten' => 'required|string|max:255',
        'password' => 'required|min:6',
        'vai_tro' => 'required'
    ]);
        $query = $request->all();
        $user = User::create([
            'username' => $query['email'],
            'email' => $query['email'],
            'mat_khau' => bcrypt($query['password']),
            'vai_tro' => $query['vai_tro']
        ]);
        if($query['vai_tro'] === RoleCode::STUDENT) {
            SinhVien::create([
                'ho_ten' => $query['ho_ten'],
                'mssv' => date('Y') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT),
                'email' => $query['email'],
                'nguoi_dung_id' => $user->id,
            ]);
        }
        if($query['vai_tro'] === RoleCode::TEACHER) {
            GiaoVien::create([
                'ho_ten' => $query['ho_ten'],
                'email' => $query['email'],
                'nguoi_dung_id' => $user->id,
            ]);
        }
        return $this->responseSuccess();
    }

    public function edit(Request $request, $id)
    {
    $request->validate([
        'email' => 'required|email|unique:nguoi_dungs,email,' . $id,
        'ho_ten' => 'required|string|max:255',
        'password' => 'nullable|min:6',
        'vai_tro' => 'required'
    ]);

    $user = User::findOrFail($id);
    $oldVaiTro = $user->vai_tro;

    $user->update([
        'username' => $request->email,
        'email' => $request->email,
        'mat_khau' => $request->filled('password') ? bcrypt($request->password) : $user->mat_khau,
        'vai_tro' => $request->vai_tro
    ]);

    // Xóa dữ liệu cũ nếu vai trò thay đổi
    if ($oldVaiTro !== $request->vai_tro) {
        if ($oldVaiTro === RoleCode::STUDENT) {
            SinhVien::where('nguoi_dung_id', $user->id)->delete();
        }
        if ($oldVaiTro === RoleCode::TEACHER) {
            GiaoVien::where('nguoi_dung_id', $user->id)->delete();
        }
    }

    // Cập nhật hoặc tạo mới bản ghi vai trò
    if ($request->vai_tro === RoleCode::STUDENT) {
        SinhVien::updateOrCreate(
            ['nguoi_dung_id' => $user->id],
            [
                'ho_ten' => $request->ho_ten,
                'mssv' => date('Y') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT),
                'email' => $request->email,
            ]
        );
    }

    if ($request->vai_tro === RoleCode::TEACHER) {
        GiaoVien::updateOrCreate(
            ['nguoi_dung_id' => $user->id],
            [
                'ho_ten' => $request->ho_ten,
                'email' => $request->email,
            ]
        );
    }

    return $this->responseSuccess();
}

    public function destroy($id)
    {
        $user = User::find($id);
        $user->delete();
        return $this->responseSuccess();
    }

    public function active(Request $request ,$id)
    {
        $user = User::find($id);
        $state = $request->get('trang_thai', true);
        $user->update([
            'trang_thai' => $state
        ]);
        return $this->responseSuccess();
    }
}
