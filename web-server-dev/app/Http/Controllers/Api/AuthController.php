<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NguoiDung;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check()) {
            return $this->auth_user(Auth::user());
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = [
            'email' => $request->email,
            'password' => $request->password,
        ];

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return back()->with('fail', 'Tài khoản hiện chưa được đăng ký.');
        } else {
            if (Auth::attempt($credentials)) {
                $user = Auth::user();
                if ($user->vai_tro == 'admin' || $user->vai_tro == 'super_admin') {
                    $this->setSessionData($request, $user);
                    return redirect("/hustLmao/admin/dashboard");
                }

                if ($user->vai_tro == 'sinh_vien') {
                    $this->setSessionData($request, $user);
                    return redirect("/hustLmao/sinhvien/dashboard");
                }

                return back()->with('fail', 'Tài khoản có thể chưa được phân quyền.');
            }
            return back()->with('fail', 'Sai địa chỉ email hoặc mật khẩu. Vui lòng thử lại.');
        }
    }

    public function register() 
    {
        return view('auth.register');
    }

    public function registerProcess(Request $request)
    {
        $ho_ten = $request->ho_ten;
        $email = $request->email;
        $username = $request->username;
        $password = $request->password;
        $confirm_password = $request->confirm_password;

        $hashedPassword = bcrypt($request->password);

        $email_in_db = DB::table('users')->where('email', '=', $email)->first();
        if (!$email_in_db) {
            if ($password == $confirm_password || $confirm_password == $password) {
                DB::table('users')->insert([
                    'ho_ten' => $ho_ten,
                    'username' => $username,
                    'password' => $hashedPassword,
                    'email' => $email,
                    'vai_tro' => 'sinh_vien',
                    'created_at' => now()
                ]);
                return redirect()->route('login')->with('success', 'Đăng ký tài khoản thành công!');
            } else {
                return back()->with('fail', 'Thông tin hoặc mật khẩu với xác nhận mật khẩu chưa đúng. Vui lòng kiểm tra lại thông tin!');
            }
        } else {
            return back()->with('fail', 'Địa chỉ email này đã tồn tại! Vui lòng sử dụng địa chỉ email khác.');
        }
    }

//     public function registerProcess(Request $request)
// {
//     // 1. Validate dữ liệu
//     $validator = Validator::make($request->all(), [
//         'ho_va_ten' => 'required|string|max:255',
//         'email' => 'required|email|unique:users,email',
//         'username' => 'required|string|max:255|unique:users,username',
//         'password' => 'required|min:6|max:20|same:confirm_password',
//         'confirm_password' => 'required|min:6|max:20'
//     ]);

//     if ($validator->fails()) {
//         return back()->withErrors($validator)->withInput();
//     }

//     // 2. Tạo người dùng mới
//     User::create([
//         'ho_ten' => $request->ho_va_ten,
//         'username' => $request->username,
//         'email' => $request->email,
//         'password' => Hash::make($request->password),
//         'vai_tro' => 'sinh_vien',
//     ]);

//     // 3. Chuyển hướng về trang đăng nhập với thông báo thành công
//     return redirect()->route('login')->with('success', 'Đăng ký tài khoản thành công!');
// }

   public function logout_admin(Request $request)
    {
        Auth::logout();
        $request->session()->forget('nguoi_dung_id');
        $request->session()->forget('ho_ten');
        $request->session()->forget('vai_tro');
        $request->session()->forget('email');
        return redirect("/hustLmao");
    }

    public function logout_sinhvien(Request $request)
    {
        Auth::logout();
        $request->session()->forget('nguoi_dung_id');
        $request->session()->forget('ho_ten');
        $request->session()->forget('vai_tro');
        $request->session()->forget('email');
        return redirect("/hustLmao/sinhvien/login");
    }

    private function setSessionData(Request $request, $user)
    {
        $request->session()->put('nguoi_dung_id', $user->nguoi_dung_id);
        $request->session()->put('ho_ten', $user->ho_ten);
        $request->session()->put('email', $user->email);
        $request->session()->put('vai_tro', $user->vai_tro);
    }

}
