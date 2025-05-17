<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\LopSinhVienExtrasController;
use Illuminate\Support\Facades\Route;

Route::group(["middleware" => ["auth:sanctum"]], function () {
    Route::group(
        [
            "middleware" => [
                "api.access.routeNeedsPermission:" .
                RoleCode::TEACHER .
                ";" .
                RoleCode::ASSISTANT .
                ";" .
                RoleCode::ADMIN,
            ],
        ],
        function () {
            Route::get("lop/{id}/sinh-vien_extras", [LopSinhVienExtrasController::class, "index"]);
            Route::post("add-student-extras", [LopSinhVienExtrasController::class, "store"]);
            Route::put("update-student-extras/{id}", [LopSinhVienExtrasController::class, "update"]);
            Route::post("delete-student-extras", [LopSinhVienExtrasController::class, "delete"]);
            Route::post("/lop-sinh-vien-extras/sinh-vien-truot-mon", [
                LopSinhVienExtrasController::class,
                "storeByMaHpAndMssv",
            ]);
            Route::post("/lop-sinh-vien-extras/truot-mon-records", [
                LopSinhVienExtrasController::class,
                "getTruotRecords",
            ]);
            Route::put("update-student-truot/{id}", [LopSinhVienExtrasController::class, "updateTruotMon"]);
        }
    );
});
