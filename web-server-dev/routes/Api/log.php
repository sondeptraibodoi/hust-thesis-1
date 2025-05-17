<?php

use App\Http\Controllers\Api\Log\LogController;

Route::get("logs", [LogController::class, "index"]);
Route::post("logs-list", [LogController::class, "index"]);

Route::get("cau-hois/{id}/logs", [LogController::class, "indexByCauHoi"]);
Route::post("cau-hois/{id}/logs-list", [LogController::class, "indexByCauHoi"]);
