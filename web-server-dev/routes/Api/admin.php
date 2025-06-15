<?php

use App\Constants\RoleCode;

use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN,
        ],
    ],
    function () {
        // Router cho role admin
    }
);
