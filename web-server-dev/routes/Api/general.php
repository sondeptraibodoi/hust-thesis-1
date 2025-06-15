<?php

use App\Http\Controllers\Api\DoAn\MonHocController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:sanctum'], function () {
    // router dùng chung cho các route
    Route::get('danh-sach-mon',  [MonHocController::class, 'index']);
});
