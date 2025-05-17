<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\HocPhanChuong\ChuongController;
use App\Http\Controllers\Api\HocPhanChuong\DiemChuongLopController;
use App\Http\Controllers\Api\HocPhanChuong\GiaoVienCauHoiController;
use App\Http\Controllers\Api\HocPhanChuong\HocPhanCauHoiChuongController;
use App\Http\Controllers\Api\HocPhanChuong\HocPhanChuongController;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ASSISTANT . ";" . RoleCode::HP_ASSISTANT,
        ],
    ],
    function () {
        Route::post("list-hoc-phan-chuong", [HocPhanChuongController::class, "index"]);
        Route::get("info-hoc-phan-chuong/{id}", [HocPhanChuongController::class, "show"]);

        Route::post("detail-hoc-phan-chuong/{id}", [ChuongController::class, "list"]);
        Route::post("detail-create-hoc-phan-chuong", [ChuongController::class, "store"]);
        Route::put("detail-edit-hoc-phan-chuong/{id}", [ChuongController::class, "update"]);
        Route::delete("detail-delete-hoc-phan-chuong/{id}", [ChuongController::class, "destroy"]);

        Route::delete("detail-delete-tai-lieu-chuong/{id}", [ChuongController::class, "destroyTaiLieuChuong"]);

        Route::post("hoc-phan-chuong/upload-pdf/{id}", [HocPhanChuongController::class, "upload"]);
        Route::post("fetch-tai-lieu-chuong-pdf", [HocPhanChuongController::class, "fetchPdf"]);

        Route::get("hoc-phan-chuong/{id}", [HocPhanChuongController::class, "detail"]);
        Route::get("tai-lieu-chuong/{id}", [HocPhanChuongController::class, "listTaiLieu"]);

        Route::get("hoc-phan-chuong/{id}/thong-ke", [HocPhanChuongController::class, "detailThongKe"]);
    }
);

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ASSISTANT . ";" . RoleCode::HP_ASSISTANT,
        ],
    ],
    function () {
        Route::post("/list-cau-hoi-hoc-phan", [HocPhanCauHoiChuongController::class, "getCauHoiChuong"]);
        Route::post("them-cau-hois", [HocPhanCauHoiChuongController::class, "store"]);
        Route::put("update-cau-hois/{id}", [HocPhanCauHoiChuongController::class, "update"]);
    }
);
Route::group(["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::STUDENT]], function () {
    Route::post("list-chuong-thi-sv", [HocPhanChuongController::class, "listChuongHocPhanSV"]);
});

Route::group(["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER]], function () {
    Route::post("list-cau-hoi-giao-vien", [GiaoVienCauHoiController::class, "listCauHoiGv"]);
    Route::get("list-hoc-phan-chuong/{maHp}", [GiaoVienCauHoiController::class, "getChuongTheoMaHp"]);
    Route::post("cau-hoi-giao-vien", [GiaoVienCauHoiController::class, "gvThemCauHoi"]);
    Route::delete("cau-hoi-giao-vien/{id}", [GiaoVienCauHoiController::class, "destroy"]);
    Route::put("cau-hoi-giao-vien/{id}/yeu-cau-phe-duyet", [GiaoVienCauHoiController::class, "yeuCauPheDuyet"]);
    Route::post("cau-hois-giao-vien", [GiaoVienCauHoiController::class, "gvThemNhieuCauHoi"]);

    Route::post("cau-hoi-phan-bien-gv", [GiaoVienCauHoiController::class, "gvPhanBienCauHoi"]);
    Route::put("cau-hoi-phan-bien-gv/{id}/phan-bien", [GiaoVienCauHoiController::class, "trangThaiPhanBien"]);
});
Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::TEACHER . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::get("diem-thi-chuong/{id}", [DiemChuongLopController::class, "index"]);
        Route::get("bieu-do-diem-thi-chuong/{id}", [DiemChuongLopController::class, "show"]);
    }
);
Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::TEACHER . ";" . RoleCode::HP_ASSISTANT,
        ],
    ],
    function () {
        Route::put("cau-hoi-giao-vien/{id}", [GiaoVienCauHoiController::class, "gvUpdateCauHoi"]);
    }
);
