<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\SinhVien\HocPhanTaiLieuController;

Route::group(["middleware" => ["auth:sanctum"]], function () {
    Route::get("sinh-vien/hoc-phan-chuong/{id}", [HocPhanTaiLieuController::class, "index"]);
});
