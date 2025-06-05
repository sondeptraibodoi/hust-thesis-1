<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ThiController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CauHoiController;
use App\Http\Resources\UserResource;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::view('/', 'welcome');

Route::get("/", "HomePageController@index");
Route::get('/', function () {
    return view('auth.login');
    // /hust-thesis/sinhvien/login
});

//Đăng nhập/đăng xuất sinh viên
Route::get('/hust-thesis/sinhvien/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/hust-thesis/sinhvien/login', [AuthController::class, 'login']);
Route::post('/hust-thesis/sinhvien/logout', [AuthController::class, 'logout_sinhvien'])->name('logout');
Route::get('/hust-thesis/sinhvien/dang_ky', [AuthController::class, 'register']);
Route::post('/hust-thesis/sinhvien/register_process', [AuthController::class, "registerProcess"])->name("registerProcess");
Route::get('/hust-thesis/sinhvien/register_process', function () {
    return redirect('/');
});

Route::get('/hust-thesis/sinhvien/dashboard', [ThiController::class, 'index']);

Route::get('/hust-thesis/admin/dashboard', [AdminController::class, 'index']);

//Quản lý câu hỏi
// Route::get('/hust-thesis/admin/cau-hoi', [CauHoiController::class, 'index'])->name('admin.cauhoi.index');;
// Route::get('/hust-thesis/admin/cau-hoi/create', [CauHoiController::class, 'create'])->name('admin.cauhoi.create');
// Route::post('/hust-thesis/admin/cau-hoi/store', [CauHoiController::class, 'store'])->name("store");
// Route::get('/hust-thesis/admin/cau-hoi/store', function () {
//     return redirect('/');
// });

Route::prefix('/hust-thesis/admin')->name('admin.')->group(function () {
    Route::get('/cau-hoi', [CauHoiController::class, 'index'])->name('cauhoi.index');
    Route::get('/cau-hoi/create', [CauHoiController::class, 'create'])->name('cauhoi.create');
    Route::post('/cau-hoi/store', [CauHoiController::class, 'store'])->name('cauhoi.store');
});

Route::post('/hust-thesis/admin/cau-hoi/store', [CauHoiController::class, 'store'])->name("store");
Route::get('/hust-thesis/admin/cau-hoi/store', function () {
    return redirect('/');
});
Route::get('/hust-thesis/admin/cauhoi/{id}/edit', [CauHoiController::class, 'edit'])->name('admin.cauhoi.edit');
Route::post('/hust-thesis/admin/cau-hoi/update/{id}', [CauHoiController::class, 'update']);
Route::get('/hust-thesis/admin/cau-hoi/update/{id}', function () {
    return redirect('/');
});

Route::delete('/hust-thesis/admin/cauhoi/{id}', [CauHoiController::class, 'destroy'])->name('admin.cauhoi.destroy');

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});