

<?php
use App\Constants\RoleCode;
use App\Http\Controllers\Api\HocPhanChuong\GiaoVienCauHoiController;
use App\Http\Controllers\Api\HocPhanChuong\TroLyCauHoiDetailController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "prefix" => "tro-ly-hoc-phan",
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::HP_ASSISTANT . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::get("cau-hoi/{id}", [TroLyCauHoiDetailController::class, "show"]);
    }
);
Route::group(
    ["prefix" => "giao-vien", "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER]],
    function () {
        Route::get("cau-hoi/{id}", [GiaoVienCauHoiController::class, "show"]);
    }
);

