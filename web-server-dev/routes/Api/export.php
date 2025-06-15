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
    }
);
