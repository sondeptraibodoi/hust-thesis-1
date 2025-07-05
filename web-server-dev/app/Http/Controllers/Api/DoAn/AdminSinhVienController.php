<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\Auth\User;
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
        'email' => 'required|email|unique:nguoi_dung,email',
        'ho_ten' => 'required|string|max:255',
        'password' => 'required|min:6',
        'vai_tro' => 'required'
    ]);
        $query = $request->all();
        User::create([
            'username' => $query['email'],
            'email' => $query['email'],
            'ho_ten' => $query['ho_ten'],
            'mat_khau' => bcrypt($query['password']),
            'vai_tro' => $query['vai_tro']
        ]);
        return $this->responseSuccess();
    }

    public function edit(Request $request, $id)
    {
        $request->validate([
        'email' => 'required|email|unique:nguoi_dung,email,' . $id,
        'ho_ten' => 'required|string|max:255'
    ]);
        $query = $request->all();
        $user = User::find($id);
        $user->update([
            'ho_ten' => $query['ho_ten'],
            'username' => $query['email'],
            'email' => $query['email'],
        ]);
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
