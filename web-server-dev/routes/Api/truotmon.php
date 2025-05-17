<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\SVTruotMonController;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::get("list-truot-mon/{id}", [SVTruotMonController::class, "index"]);
        Route::post("add-truot-mon", [SVTruotMonController::class, "store"]);
        Route::put("update-truot-mon/{id}", [SVTruotMonController::class, "update"]);
        Route::post("delete-truot-mon/{id}", [SVTruotMonController::class, "delete"]);
    }
);
