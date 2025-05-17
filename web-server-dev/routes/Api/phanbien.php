

<?php
use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\LopSinhVienGiaoVienPhanBienController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER],
    ],
    function () {
        Route::post("list-sinh-vien-phan-bien", [LopSinhVienGiaoVienPhanBienController::class, "listSinhVienPhanBien"]);
    }
);

