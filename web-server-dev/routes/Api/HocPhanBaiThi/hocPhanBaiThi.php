<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\HocPhanChuong\HocPhanBaiThiController;

Route::group(["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::ASSISTANT]], function () {
    Route::post("hoc-phan-bai-thi", [HocPhanBaiThiController::class, "index"]);
    Route::get("hoc-phan-bai-thi/{id}", [HocPhanBaiThiController::class, "showBaiThi"]);
    Route::delete("hoc-phan-bai-thi/{id}", [HocPhanBaiThiController::class, "destroy"]);
});
