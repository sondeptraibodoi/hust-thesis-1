<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class HealthCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "health:check";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Kiểm tra tình trạng của dịch vụ web và lưu trữ phản hồi.";

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            $response = Http::get(config("app.detext_api") . "submit_job");
            if ($response->status() === 200 || $response->status() === 405) {
                Cache::put("health_status", "ok", 24 * 60 * 60);
            } else {
                Cache::put("health_status", "error", 24 * 60 * 60);
            }
        } catch (\Exception $e) {
            Cache::put("health_status", "error", 24 * 60 * 60);
        }
    }
}
