<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "config"], function () {
    Route::get("bao-cao", [SettingController::class, "getSettingBaoCao"]);
    Route::post("bao-cao/{ki_hoc}", [SettingController::class, "updateSettingBaoCao"]);
    Route::post("hust", [SettingController::class, "updateHust"]);
    Route::post("dong-diem-danh", [SettingController::class, "ngayDongDiemDanh"]);
    Route::post("dong-bao-cao", [SettingController::class, "ngayDongBaoCao"]);
    Route::post("list-dong-diem-danh", [SettingController::class, "listDongDiemDanh"]);
    Route::post("list-dong-bao-cao", [SettingController::class, "listDongBaoCao"]);
    Route::put("dong-diem-danh/{id}", [SettingController::class, "updateDongDiemDanh"]);
    Route::put("dong-bao-cao/{id}", [SettingController::class, "updateDongBaoCao"]);
    Route::delete("dong-diem-danh/{id}", [SettingController::class, "destroyDongDiemDanh"]);
    Route::post("lich-hoc", [SettingController::class, "timKiemLichHoc"]);
    Route::get("lich-hoc", [SettingController::class, "timKiemLichHoc"]);
    Route::post("lich-hoc-bao-cao", [SettingController::class, "timKiemBaoCao"]);
    Route::group(
        [
            "middleware" => [
                "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
                "auth:sanctum",
            ],
        ],
        function () {
            Route::get("setting", [SettingController::class, "index"]);
        }
    );
});
