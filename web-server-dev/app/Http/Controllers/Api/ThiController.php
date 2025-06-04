<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThiController extends Controller
{
    public function index()
{
    if (!Auth::check()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Chưa đăng nhập',
        ], 401);  // 401 Unauthorized
    }

    return response()->json([
        'status' => 'success',
        'message' => 'Truy cập dashboard thành công',
        'user' => Auth::user(),
    ], 200);
}

}
