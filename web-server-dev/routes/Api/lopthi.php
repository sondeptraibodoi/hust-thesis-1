<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Diem\DiemController;
use App\Http\Controllers\Api\Export\ExportExcelController;
use App\Http\Controllers\Api\Lop\LopThiController;
use App\Http\Controllers\Api\Lop\SinhVienLopThiController;
use App\Http\Controllers\Api\Lop\GiaoVienLopThiController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::TEACHER . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::get("lop-thi", [LopThiController::class, "index"]);
        Route::get("lop-thi/{id}", [LopThiController::class, "show"]);
        Route::get("lop-thi/{id}/diem", [DiemController::class, "indexForLopThi"]);
        Route::get("lop-thi-giao-vien/show/{id}", [LopThiController::class, "lopThiGiaoVien"]);
        Route::get("lop-thi-giao-vien/{id}", [LopThiController::class, "lopThiGiaoVien"]);
        Route::get("lop-thi-nhan-dien/{id}", [LopThiController::class, "lopThiNhanDien"]);
        Route::post("lop-thi-list", [LopThiController::class, "indexAgGrid"]);
        Route::post("lop-thi-filter", [LopThiController::class, "LopThiFilter"]);
        Route::post("lop-thi-mon/{id}", [LopThiController::class, "LopThiMon"]);
        Route::post("giao-vien-trong-thi", [LopThiController::class, "giaoVienTrongThi"]);
        Route::post("lop-coi-thi-gv-detail", [LopThiController::class, "lopCoiThiGiaoVienDetail"]);
    }
);
Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" .
            RoleCode::HP_OFFICE .
            ";" .
            RoleCode::ADMIN .
            ";" .
            RoleCode::TEACHER .
            ";" .
            RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("lop-thi-ki", [LopThiController::class, "lopThiKi"]);
        Route::post("giao-vien-trong-thi-send-mail", [LopThiController::class, "giaoVienTrongThiSendMail"]);
        Route::post("giao-vien-trong-thi-save", [LopThiController::class, "giaoVienTrongThiSave"]);
        Route::post("export/xep-lich-thi-gv/excel", [ExportExcelController::class, "exportLopCoiThiGV"]);
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
        Route::post("lop-thi/add", [LopThiController::class, "store"]);
        Route::put("lop-thi/update/{id}", [LopThiController::class, "update"]);
        Route::delete("lop-thi/delete/{id}", [LopThiController::class, "destroy"]);
        Route::post("lop-this/{id}/emails", [LopThiController::class, "sendEmail"]);
    }
);

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::STUDENT],
    ],
    function () {
        Route::post("student-lop-thi-list", [SinhVienLopThiController::class, "indexAgGird"]);
        Route::post("lop-thi-sv", [LopThiController::class, "getLopThiSV"]);
    }
);

Route::group(
    [
        "middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::TEACHER],
    ],
    function () {
        Route::post("teacher-lop-thi-list", [GiaoVienLopThiController::class, "indexAgGird"]);
        Route::get("teacher-lop-thi-list/{id}", [GiaoVienLopThiController::class, "show"]);
    }
);
