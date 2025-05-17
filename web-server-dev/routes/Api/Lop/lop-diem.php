<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\LopDiemController;
use Illuminate\Support\Facades\Route;
Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("lop-diem-list", [LopDiemController::class, "index"]);
        Route::delete("lop-diem/{id}", [LopDiemController::class, "destroy"]);
    }
);
