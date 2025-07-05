<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\DoAn\AdminSinhVienController;
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
    }
);
