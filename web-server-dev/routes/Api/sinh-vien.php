<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\DoAn\BaiLamController;
use App\Http\Controllers\Api\DoAn\DeThiController;
use App\Http\Controllers\Api\DoAn\MonHocController;
use App\Http\Controllers\Api\DoAn\ThiController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::STUDENT,
        ],
    ],
    function () {
        // Router cho role sinh vien
        Route::get('mon/{id}',  [MonHocController::class, 'getLevel']);
        Route::get('cau-hoi-danh-gia',[ThiController::class, 'cauHoiDanhGia']);
        Route::post('nop-bai', [ThiController::class, 'nopBai']);
        Route::get('lay-de-thi/{id}', [DeThiController::class, 'getDeThiRandom']);
        Route::get('bai-lam', [BaiLamController::class, 'index']);
    }
);
