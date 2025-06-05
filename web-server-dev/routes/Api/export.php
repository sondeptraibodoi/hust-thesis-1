<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Export\ExportDiemController;
use App\Http\Controllers\Api\Export\ExportExcelController;
use App\Http\Controllers\Api\Export\ExportPdfController;
use App\Http\Controllers\Api\Export\ExportThongKeMaHocPhanController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "prefix" => "export",
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::TEACHER,
        ],
    ],
    function () {
        // Route::post("lop-sinh-vien/{id}/sinh-viens", [ExportPdfController::class, "exportLopSv"]);
        // Route::post("lop-li-thuyet/{id}/lop-lt", [ExportPdfController::class, "exportLopLt"]);
        // Route::post("lop-sinh-vien/{id}/excel", [ExportExcelController::class, "exportDiemDanh"]);
        // Route::post("sinh-vien-lop/{id}/excel", [ExportExcelController::class, "exportSinhVien"]);
        // Route::post("lop-sinh-vien-all/{id}/excel", [ExportExcelController::class, "exportDiemDanhAll"]);
        // Route::post("sinh-vien-lop-all/{id}/excel", [ExportExcelController::class, "exportSinhVienAll"]);
        // Route::post("diem-thanh-tich/{id}/pdf", [ExportPdfController::class, "exportDiemThanhTich"]);
        // Route::post("diem-thanh-tich-all/{id}/pdf", [ExportPdfController::class, "exportAllDiemThanhTich"]);
        // Route::post("phuc-khao/excel", [ExportExcelController::class, "exportPhucKhao"]);
        // // Route::post("xep-lich-thi-gv/excel", [ExportExcelController::class, "exportLopCoiThiGV"]);
        // Route::post("thong-ke-diem-danh/excel", [ExportExcelController::class, "exportThongKeDiemDanh"]);
        // Route::post("thi-bu/excel", [ExportExcelController::class, "exportThiBu"]);
        // Route::post("thong-ke-diem/excel", [ExportExcelController::class, "exportThongKeDiem"]);
        // Route::post("diem-qt/{id}", [ExportDiemController::class, "excelDiemQT"]);
        // Route::post("diem-ck/{id}", [ExportDiemController::class, "excelDiemCK"]);
        // Route::post("all-diem-qt", [ExportDiemController::class, "excelAllDiemQT"]);
        // Route::post("all-diem-ck", [ExportDiemController::class, "excelAllDiemCK"]);
        // Route::post("all-diem", [ExportDiemController::class, "excelAllDiem"]);
        // Route::post("thong-ke-ma-hoc-phan", [ExportThongKeMaHocPhanController::class, "export"]);
    }
);
