<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\TaiLieu\TroLyHocPhanController;
Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ASSISTANT . ";" . RoleCode::HP_ASSISTANT,
        ],
    ],
    function () {
        Route::post("tai-lieu-hoc-phan-theo-ma", [TroLyHocPhanController::class, "index"]);
        Route::post("quan-ly-hoc-phan", [TroLyHocPhanController::class, "store"]);
        Route::post("copy-tai-lieu-hoc-phan/{id}", [TroLyHocPhanController::class, "copy"]);
        Route::put("tai-lieu-hoc-phan", [TroLyHocPhanController::class, "update"]);
        Route::delete("tai-lieu/{ma_hp}/{id_tai_lieu}", [TroLyHocPhanController::class, "delete"]);
    }
);
