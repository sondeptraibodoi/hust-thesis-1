<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\TaiLieu\TaiLieuHocPhanController;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("list-tai-lieu-hoc-phan", [TaiLieuHocPhanController::class, "index"]);
        Route::post("add-tai-lieu-hoc-phan", [TaiLieuHocPhanController::class, "store"]);
        Route::put("tai-lieu-hoc-phan/{id}", [TaiLieuHocPhanController::class, "update"]);
        Route::delete("delete-tai-lieu-hoc-phan/{id}", [TaiLieuHocPhanController::class, "delete"]);
    }
);
