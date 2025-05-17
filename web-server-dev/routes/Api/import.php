<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\Import\ImportDoAnController;
use App\Http\Controllers\Api\Import\ImportGiaoVienController;
use App\Http\Controllers\Api\Import\ImportLopHocController;
use App\Http\Controllers\Api\Import\ImportLopHocDiemController;
use App\Http\Controllers\Api\Import\ImportLopThiBuController;
use App\Http\Controllers\Api\Import\ImportLopThiController;
use App\Http\Controllers\Api\Import\ImportReadController;
use App\Http\Controllers\Api\Import\ImportSinhVienController;
use App\Http\Controllers\Api\Import\ImportSinhVienLopThiController;
use App\Http\Controllers\Api\Import\ImportPhucKhaoController;
use App\Http\Controllers\Api\Import\ImportSinhVienPhanBienController;
use App\Http\Controllers\Api\Import\ImportTinNhanController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "prefix" => "import",
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("giao-vien", [ImportGiaoVienController::class, "import"]);
        Route::post("lop", [ImportLopHocController::class, "import"]);
        Route::post("sinh-vien", [ImportSinhVienController::class, "import"]);
        Route::post("lop-thi", [ImportLopThiController::class, "importLopThi"]);
        Route::post("sinh-vien-lop-thi", [ImportSinhVienLopThiController::class, "importSinhVienLopThi"]);
        Route::post("lop-thi-bu", [ImportLopThiBuController::class, "import"]);
        Route::post("do-an", [ImportDoAnController::class, "import"]);
        Route::post("phan-bien", [ImportSinhVienPhanBienController::class, "import"]);
        Route::post("lop-hoc-diem", [ImportLopHocDiemController::class, "import"]);
        Route::post("tin-nhan", [ImportTinNhanController::class, "import"]);
    }
);

Route::group(
    [
        "prefix" => "import",
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" . RoleCode::TEACHER . ";" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
        ],
    ],
    function () {
        Route::post("diem-phuc-khao", [ImportPhucKhaoController::class, "import"]);
    }
);

Route::group(["prefix" => "import", "middleware" => ["auth:sanctum"]], function () {
    Route::post("excel", [ImportReadController::class, "readExcel"]);
});
