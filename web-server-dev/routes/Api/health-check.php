<?php

use Illuminate\Support\Facades\Route;

Route::get("/health-check", "HealthCheckController@checkCache");
Route::get("/health-check-review", "HealthCheckController@clearCacheAndCheck");
