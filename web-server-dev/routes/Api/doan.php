<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\DoAn\DanhGiaController;

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER],
    ],
    function () {}
);

Route::group(["prefix" => "do-an"], function () {
    Route::get("thong-tin-sinh-vien-do-an/{lop_id}/{sinh_vien_id}", [DanhGiaController::class, "show"]);
    Route::get("danh-gia/{lop_id}/{sinh_vien_id}", [DanhGiaController::class, "index"]);
    Route::post("danh-gia-sinh-vien", [DanhGiaController::class, "store"]);
    Route::put("danh-gia-sinh-vien/{id}", [DanhGiaController::class, "update"]);
    Route::delete("danh-gia-sinh-vien/{id}", [DanhGiaController::class, "destroy"]);
});
