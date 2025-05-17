

<?php
use App\Constants\RoleCode;
use App\Http\Controllers\Api\Lop\SinhVienThucTapController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT . ";" . RoleCode::TEACHER,
        ],
    ],
    function () {
        Route::get("lop/{id}/list-thuc-tap", [SinhVienThucTapController::class, "listThucTap"]);
        Route::put("duyet-sv-thuc-tap/{id}", [SinhVienThucTapController::class, "duyetThucTap"]);
    }
);

Route::group(
    [
        "middleware" => ["cacheResponse:3600", "auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::STUDENT],
    ],
    function () {
        Route::get("lop/{id}/is-thuc-tap", [SinhVienThucTapController::class, "IsThucTap"]);
        Route::get("lop/{id}/sv-thuc-tap", [SinhVienThucTapController::class, "SvThucTap"]);
        Route::put("edit-sv-thuc-tap/{id}", [SinhVienThucTapController::class, "update"]);
        Route::post("add-sv-thuc-tap", [SinhVienThucTapController::class, "store"]);
        Route::delete("delete-sv-thuc-tap/{id}", [SinhVienThucTapController::class, "delete"]);
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
        Route::get("lop/{id}/is-thuc-tap-no-do-an", [SinhVienThucTapController::class, "IsThucTapNoDoAn"]);
        Route::post("admin/list-thuc-tap", [SinhVienThucTapController::class, "listThucTapAdmin"]);
        Route::post("admin/list-do-an", [SinhVienThucTapController::class, "listDoAnAdmin"]);
        Route::put("admin/edit-sv-do-an/{id}", [SinhVienThucTapController::class, "updateDoAnAdmin"]);
        Route::post("admin/export/thuc-tap/excel", [SinhVienThucTapController::class, "exportThucTap"]);
        Route::post("admin/export/do-an/excel", [SinhVienThucTapController::class, "exportDoAn"]);
        Route::post("admin/list-phan-bien", [SinhVienThucTapController::class, "listPhanBienAdmin"]);
    }
);

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER],
    ],
    function () {
        Route::post("list-thuc-tap-do-an", [SinhVienThucTapController::class, "listThucTapDoAn"]);
        Route::post("list-thuc-tap-giao-vien", [SinhVienThucTapController::class, "listThucTapGv"]);
        Route::post("list-do-an-tot-nghiep", [SinhVienThucTapController::class, "listDoAnTotNghiep"]);
        Route::put("edit-sv-do-an/{id}", [SinhVienThucTapController::class, "updateDoAn"]);
        Route::put("edit-sv-do-an-tot-nghiep/{id}", [SinhVienThucTapController::class, "updateDoAnTotNghiep"]);
    }
);

