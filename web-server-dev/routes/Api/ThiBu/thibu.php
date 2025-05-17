<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\SinhVienLopController;
use App\Http\Controllers\Api\ThiBu\SinhVienThiBuController;
use App\Http\Controllers\Api\ThiBu\TroLyThiBuController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::STUDENT],
    ],
    function () {
        Route::post("thi-bu-sv", [SinhVienThiBuController::class, "listRegisExam"]);
        Route::post("thi-bu", [SinhVienThiBuController::class, "store"]);
        Route::put("thi-bu-update/{id}", [SinhVienThiBuController::class, "update"]);
        Route::delete("thi-bu/{id}", [SinhVienThiBuController::class, "destroy"]);
        Route::post("thi-bu-update/{id}", [SinhVienThiBuController::class, "update"]);
        // Route::post('thi-bu/{id}/images', [SinhVienThiBuController::class, 'addImages']);
        Route::post("thi-bu/image", [SinhVienThiBuController::class, "addImage"]);
        Route::delete("thi-bu/{id}", [SinhVienThiBuController::class, "destroy"]);
        Route::delete("thi-bu/{id}/image/{image_id}", [SinhVienThiBuController::class, "deleteImage"]);
        Route::get("thi-bu-sv/{id}", [SinhVienThiBuController::class, "show"]);
        Route::get("student-lop-hp", [SinhVienLopController::class, "lopHp"]);
    }
);

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("list-thi-bu", [TroLyThiBuController::class, "index"]);
        Route::put("update-thi-bu/{id}", [TroLyThiBuController::class, "update"]);
        Route::get("detail-thi-bu/{id}", [TroLyThiBuController::class, "show"]);
    }
);
