<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Storage;

class SystemController extends Controller
{
    public function checkUpdate()
    {
        try {
            $filePath = "check-update.json";
            if (!Storage::exists($filePath)) {
                return response()->json();
            }
            $content = Storage::get($filePath);
            if (empty($content)) {
                return response()->json();
            }
            $content = json_decode($content, true);
            $now = Carbon::now();
            $is_updated = $content["is_updated"] ?? false;
            $time_update = Carbon::parse($content["time_update"]);
            $time_update_done = !empty($content["time_update_done"])
                ? Carbon::parse($content["time_update_done"])
                : null;
            $time_update_end = isset($content["time_update_end"])
                ? Carbon::parse($content["time_update_end"])
                : $time_update->clone()->addHour();
            if ($time_update_end->lessThan($now)) {
                return response()->json();
            }
            if ($time_update->diffInHours($now) > 12) {
                return response()->json();
            }
            if ($is_updated) {
                return response()->json([
                    "time_update" => $time_update,
                    "time_update_end" => $time_update_end,
                    "time_update_done" => $time_update_done,
                    "description" =>
                        "Hệ thống đã được nâng cấp. Xin vui lòng khởi động lại tab để cập nhật dữ liệu mới.",
                ]);
            }
            $time_update = $time_update->format(config("app.format_datetime"));
            $time_update_end = $time_update_end->format(config("app.format_datetime"));
            return response()->json([
                "time_update" => $time_update,
                "time_update_end" => $time_update_end,
                "description" => "Hệ thống chuẩn bị cập nhật từ {$time_update} đến {$time_update_end}",
            ]);
        } catch (\Throwable $th) {
            return response()->json();
        }
    }
}
