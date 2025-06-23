<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\DoAn\CauHoiController;
use App\Http\Controllers\Api\DoAn\MonHocController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:sanctum'], function () {
    // router dùng chung cho các route
    Route::get('danh-sach-mon',  [MonHocController::class, 'index']);
    Route::get('mon-hoc/{id}',  [MonHocController::class, 'show']);
});

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::TEACHER,
        ],
    ],
    function () {
        Route::get('list-cau-hoi',  [CauHoiController::class, 'index']);
        Route::post('cau-hoi', [CauHoiController::class, 'store']);
        Route::put('cau-hoi/{id}', [CauHoiController::class, 'edit']);
        Route::delete('cau-hoi/{id}', [CauHoiController::class, 'destroy']);
    }
);
