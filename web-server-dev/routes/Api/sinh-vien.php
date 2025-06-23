<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\DoAn\MonHocController;
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
    }
);
