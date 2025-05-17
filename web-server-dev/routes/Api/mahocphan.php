<?php

use App\Constants\RoleCode;
use App\Http\Controllers\Api\MaHocPhan\MaHocPhanController;
use Illuminate\Support\Facades\Route;

Route::group(
    [
        "middleware" => "auth:sanctum",
        "namespace" => "MaHocPhan",
        "api.access.routeNeedsPermission:" . RoleCode::ADMIN . ";" . RoleCode::ASSISTANT,
    ],
    function () {
        Route::apiResource("maHocPhan", "MaHocPhanController")->except(["index"]);
        Route::post("ma-hoc-phan-list", "MaHocPhanController@indexAgGrid");
        Route::get("maHocPhan/{id}", "MaHocPhanController@show");
    }
);
