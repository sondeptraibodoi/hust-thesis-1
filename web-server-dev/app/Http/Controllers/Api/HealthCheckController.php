<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Cache;
use Http;

class HealthCheckController extends Controller
{
    public function checkCache(Request $request)
    {
        $cache = Cache::get("health_status");
        if (!empty($cache)) {
            if ($cache == "ok") {
                return response()->json([
                    "status" => "ok",
                    "message" => "Server hoạt động bình thường",
                ]);
            } else {
                return response()->json(["status" => "error", "message" => "Lỗi server"], 500);
            }
        }
        return $this->check($request);
    }
    public function check(Request $request)
    {
        try {
            $response = Http::get(config("app.detext_api") . "submit_job");
            if ($response->status() === 200 || $response->status() === 405) {
                Cache::put("health_status", "ok", 24 * 60 * 60);
                return response()->json([
                    "status" => "ok",
                    "message" => "Server hoạt động bình thường",
                ]);
            } else {
                Cache::put("health_status", "error", 24 * 60 * 60);
                return response()->json(["status" => "error", "message" => "Lỗi server"], 500);
            }
        } catch (\Exception $e) {
            Cache::put("health_status", "error", 24 * 60 * 60);
            return response()->json(
                [
                    "status" => "error",
                    "message" => "Lỗi khi gửi request đến web service",
                ],
                500
            );
        }
    }

    public function clearCacheAndCheck(Request $request)
    {
        Cache::forget("health_status");
        return $this->check($request);
    }
}
