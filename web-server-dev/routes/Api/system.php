<?php

/**
 * User Controllers
 */

use App\Constants\RoleCode;
use App\Http\Controllers\Api\System\ThongKeController;
use Illuminate\Support\Facades\Route;

Route::group(["namespace" => "System"], function () {
    Route::get("system/check-update", "SystemController@checkUpdate");
    Route::group(["middleware" => "auth:sanctum"], function () {
        Route::post("checkPassword", "UserController@checkPassword");
        Route::group(
            [
                "middleware" => ["api.access.routeNeedsPermission:" . RoleCode::ADMIN],
            ],
            function () {
                Route::apiResource("users", "UserController");
                Route::post("/users/{id}/reset-password", "UserController@updatePassword");
                Route::post("users-list", "UserController@indexAgGird");
                Route::put("/users/{id}/active", "UserController@activeUser");
                Route::put("/users/{id}/inactive", "UserController@inactiveUser");
                Route::post("/editAdmin/profile", "UserController@updateAdmin");
            }
        );
    });

    Route::group(
        [
            "middleware" => [
                "auth:sanctum",
                "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
            ],
        ],
        function () {
            Route::post("thong-ke-du-lieu/{kiHoc}", [ThongKeController::class, "thongKeDuLieu"]);
        }
    );
});
