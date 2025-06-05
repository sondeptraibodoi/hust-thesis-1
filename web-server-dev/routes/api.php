<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoAn\UserController;
use App\Http\Controllers\Api\DoAn\CauHoiController;
use App\Http\Controllers\Api\DoAn\AuthController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('cau-hoi')->group(function () {
    Route::get('/', [CauHoiController::class, 'index']);             
    Route::post('/', [CauHoiController::class, 'store']);             
    Route::get('/{id}', [CauHoiController::class, 'show']);          
    Route::put('/{id}', [CauHoiController::class, 'update']);         
    Route::delete('/{id}', [CauHoiController::class, 'destroy']);     
});

Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('nguoi-dung', UserController::class);

Route::prefix('sinh-vien')->group(function () {
    Route::get('/', [UserController::class, 'indexSinhVien']);
    Route::post('/', [UserController::class, 'storeSinhVien']);
    Route::get('/{id}', [UserController::class, 'showSinhVien']);
    Route::put('/{id}', [UserController::class, 'updateSinhVien']);
    Route::delete('/{id}', [UserController::class, 'destroySinhVien']);
});


Route::group(
    [
        "namespace" => "Api",
    ],
    function () {
        includeRouteFiles(__DIR__ . "/Api/");
    }
);

Broadcast::routes(["middleware" => ["auth:sanctum"]]);
