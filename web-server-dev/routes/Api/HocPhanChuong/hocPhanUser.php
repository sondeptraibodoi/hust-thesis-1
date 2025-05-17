<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\MaHocPhan\HocPhanUserController;

Route::group(
    ["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::HP_ASSISTANT]],
    function () {
        Route::get("list-hoc-phan-user", [HocPhanUserController::class, "index"]);
    }
);
