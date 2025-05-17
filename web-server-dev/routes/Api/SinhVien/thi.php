<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\SinhVien\ThiController;

Route::group(["middleware" => ["auth:sanctum"]], function () {
    Route::post("sinh-vien/thi-hoc-phan-chuong", [ThiController::class, "createExam"]);
    Route::post("sinh-vien/thi-hoc-phan-chuong/nop-bai", [ThiController::class, "submitAnswers"]);
    Route::post("sinh-vien/thi-hoc-phan-chuong/nop-cau-hoi", [ThiController::class, "submitQuestion"]);
});
