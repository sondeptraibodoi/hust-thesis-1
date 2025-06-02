<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TinNhan\PkSmsBankController;
use App\Http\Controllers\CauHoiController;
use App\Http\Controllers\AuthController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cau-hoi', [CauHoiController::class, 'index']);
    Route::post('/cau-hoi', [CauHoiController::class, 'store']);
});

Route::post('/login', [AuthController::class, 'login']);



Route::group(
    [
        "namespace" => "Api",
    ],
    function () {
        includeRouteFiles(__DIR__ . "/Api/");
    }
);

Broadcast::routes(["middleware" => ["auth:sanctum"]]);
