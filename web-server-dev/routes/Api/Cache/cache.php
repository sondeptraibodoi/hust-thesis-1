
<?php
use App\Http\Controllers\Api\CacheController;
use App\Http\Controllers\Api\DoAn\GiaoVienController;
use App\Http\Controllers\Api\DoAn\LopController as LopHocController;
use App\Http\Controllers\Api\DoAn\LopController as LopThiController;
use App\Http\Controllers\Api\User\SinhVienController;
use App\Http\Controllers\Api\Lop\GiaoVienLopController;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "cache"], function () {
    Route::get("clear", [CacheController::class, "clear"]);
    Route::group(["middleware" => ["cacheResponse:600", "auth:sanctum"]], function () {
        Route::get("giao-vien", [GiaoVienController::class, "index"]);
        Route::get("sinh-vien", [SinhVienController::class, "indexAgGrid"]);
        Route::get("lop", [LopHocController::class, "index"]);
        Route::get("lop-thi", [LopThiController::class, "index"]);
        // Route::get("phuc-khao-qr-code", [PhucKhaoStudentController::class, "indexThanhToan"]);
    });
    Route::group(["middleware" => ["cacheResponse:3600"]], function () {
        // Route::get("ki-hoc", [KiHocController::class, "index"]);
        Route::get("loai-lop-thi", [LopThiController::class, "LoaiLopThi"]);
    });
    Route::get("lop-ma-hps", [GiaoVienLopController::class, "getMaHp"]);
});
