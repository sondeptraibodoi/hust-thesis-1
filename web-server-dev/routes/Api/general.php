<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\DoAn\CauHoiController;
use App\Http\Controllers\Api\DoAn\DeThiController;
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
        Route::get('cau-hoi',  [CauHoiController::class, 'index']);
        Route::post('cau-hoi', [CauHoiController::class, 'store']);
        Route::put('cau-hoi/{id}', [CauHoiController::class, 'edit']);
        Route::delete('cau-hoi/{id}', [CauHoiController::class, 'destroy']);
        Route::get('de-thi/{id}', [DeThiController::class, 'show']);
        Route::get('list-de-thi',  [DeThiController::class, 'index']);
        Route::post('de-thi', [DeThiController::class, 'store']);
        Route::put('de-thi/{id}', [DeThiController::class, 'update']);
        Route::delete('de-thi/{id}', [DeThiController::class, 'destroy']);
    }
);
