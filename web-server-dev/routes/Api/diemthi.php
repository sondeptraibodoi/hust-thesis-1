

<?php
use App\Constants\RoleCode;
use App\Http\Controllers\Api\Diem\DiemThiSvController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::STUDENT],
    ],
    function () {
        Route::get("lop/{id}/sinh-vien-diem", [DiemThiSvController::class, "DiemThis"]);
    }
);

