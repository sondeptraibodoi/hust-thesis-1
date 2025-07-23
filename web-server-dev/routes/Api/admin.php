<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\DoAn\AdminSinhVienController;
use App\Http\Controllers\Api\DoAn\PhanCongController;
use App\Http\Controllers\Api\DoAn\ThongKeController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN,
        ],
    ],
    function () {
        // Router cho role admin
        Route::get('tai-khoan', [AdminSinhVienController::class, 'index']);
        Route::post('tai-khoan', [AdminSinhVienController::class, 'store']);
        Route::put('tai-khoan/{id}', [AdminSinhVienController::class, 'edit']);
        Route::delete('tai-khoan/{id}', [AdminSinhVienController::class, 'destroy']);
        Route::put('tai-khoan-active/{id}', [AdminSinhVienController::class, 'active']);
        Route::post('tong-hop-diem', [ThongKeController::class, 'chartDiemThongKe']);
        Route::get('phan-mon', [PhanCongController::class, 'indexMon']);
        Route::post('phan-mon', [PhanCongController::class, 'storeMon']);
        Route::put('phan-mon/{id}', [PhanCongController::class, 'updateMon']);
        Route::delete('phan-mon/{id}', [PhanCongController::class, 'deleteMon']);
        Route::get('phan-lop', [PhanCongController::class, 'indexLop']);
        Route::post('phan-lop', [PhanCongController::class, 'storeLop']);
        Route::put('phan-lop/{id}', [PhanCongController::class, 'updateLop']);
        Route::delete('phan-lop/{id}', [PhanCongController::class, 'deleteLop']);
    }
);
