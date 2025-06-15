<?php

use Illuminate\Support\Facades\Route;
use app\Http\Controllers\Api\DoAn\UserController;
use app\Http\Controllers\Api\DoAn\CauHoiController;
use app\Http\Controllers\Api\DoAn\ThiController;
use app\Http\Controllers\Api\DoAn\ThongKeController;
use app\Http\Controllers\Api\DoAn\AdminSinhVienController;

Route::group(
    [
        "namespace" => "Api",
    ],
    function () {
        includeRouteFiles(__DIR__ . "/Api/");
    }
);

Broadcast::routes(["middleware" => ["auth:sanctum"]]);
