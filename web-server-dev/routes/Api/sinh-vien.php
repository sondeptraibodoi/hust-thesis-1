<?php

use App\Constants\RoleCode;

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
    }
);
