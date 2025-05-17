<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\DiemDanhController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::TEACHER . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::get("diem-danh", [DiemDanhController::class, "index"]);
        Route::get("diem-danh/{id}", [DiemDanhController::class, "show"]);
        Route::put("diem-danh-lop", [DiemDanhController::class, "updateDiemdanh"]);
        Route::delete("diem-danh/{id}", [DiemDanhController::class, "delete"]);
    }
);
