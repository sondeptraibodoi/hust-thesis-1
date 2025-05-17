<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\TaiLieu\GiaoVienTaiLieuController;
use App\Http\Controllers\Api\TaiLieu\SinhVienTaiLieuController;
use App\Http\Controllers\Api\TaiLieu\TaiLieuChungController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => "auth:sanctum",
        "namespace" => "TaiLieu",
        "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
    ],
    function () {
        Route::apiResource("loaiTaiLieu", "LoaiTaiLieuController")->except(["index"]);
        Route::post("loai-tai-lieu-list", "LoaiTaiLieuController@indexAgGrid");
        Route::get("loaiTaiLieu/{id}", "LoaiTaiLieuController@show");

        //Tai Lieu
        Route::post("tai-lieus", [TaiLieuChungController::class, "index"]);
        Route::post("them-tai-lieus", [TaiLieuChungController::class, "store"]);
        Route::put("tai-lieus/{id}", [TaiLieuChungController::class, "update"]);
        Route::delete("tai-lieus/{id}", [TaiLieuChungController::class, "destroy"]);
    }
);

Route::group(["middleware" => ["api.access.routeNeedsPermission:" . RoleCode::TEACHER]], function () {
    Route::post("teacher-tai-lieu-list", [GiaoVienTaiLieuController::class, "index"]);
    Route::post("teacher-them-tai-lieus", [GiaoVienTaiLieuController::class, "store"]);
    Route::put("teacher-tai-lieus/{id}", [GiaoVienTaiLieuController::class, "update"]);
    Route::delete("teacher-tai-lieus/{id}", [GiaoVienTaiLieuController::class, "destroy"]);
    Route::get("teacher-lop-list/{id}/tai-lieus", [GiaoVienTaiLieuController::class, "taiLieuLop"]);
    Route::post("teacher-them-tai-lieu-lop/{id}", [GiaoVienTaiLieuController::class, "gvThemTaiLieuLop"]);
    Route::delete("teacher-tai-lieus/{lopId}/{id}", [GiaoVienTaiLieuController::class, "gvXoaTaiLieuLop"]);
    Route::post("teacher-copy-tai-lieu-lop/{id}/{lopTaiLieuId?}", [
        GiaoVienTaiLieuController::class,
        "gvThemNhieuTaiLieuLop",
    ]);
});

Route::group(
    [
        "middleware" => ["cacheResponse:3600", "auth:sanctum"],
        "api.access.routeNeedsPermission:" . RoleCode::STUDENT,
    ],
    function () {
        Route::get("student-lop-list/{id}/tai-lieus", [SinhVienTaiLieuController::class, "listTaiLieuSV"]);

        Route::get("student-hoc-phan-chuong-list", [SinhVienTaiLieuController::class, "listHocPhanChuong"]);
    }
);

Route::group(
    [
        "middleware" => ["cacheResponse:3600", "auth:sanctum"],
    ],
    function () {
        Route::post("tai-lieu-chungs", [TaiLieuChungController::class, "indexQuyDinh"]);
    }
);
