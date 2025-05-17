<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\NhiemVu\NhiemVuController;
use App\Http\Controllers\Api\NhiemVu\NhiemVuCuaToiController;
use App\Http\Controllers\Api\PhucKhao\PhucKhaoAdminController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("nhiem-vus", [NhiemVuController::class, "index"]);
        Route::post("them-nhiem-vus", [NhiemVuController::class, "store"]);
        Route::put("nhiem-vus/{id}", [NhiemVuController::class, "update"]);
        Route::post("du-lieu-phuc-khao", [NhiemVuController::class, "duLieuPhucKhao"]);
        Route::delete("nhiem-vus/{id}", [NhiemVuController::class, "delete"]);
    }
);
Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER],
    ],
    function () {
        Route::get("nhiem-vu-cua-toi", [NhiemVuCuaToiController::class, "index"]);
    }
);

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT . ";" . RoleCode::TEACHER,
        ],
    ],
    function () {
        Route::get("nhiem-vu-cua-toi/{id}", [NhiemVuCuaToiController::class, "show"]);
        Route::put("nhiem-vu-cua-toi/{id}", [NhiemVuCuaToiController::class, "update"]);
        Route::post("phuc-khao-nhiem-vu", [PhucKhaoAdminController::class, "indexNhiemVuAgGrid"]);
    }
);
