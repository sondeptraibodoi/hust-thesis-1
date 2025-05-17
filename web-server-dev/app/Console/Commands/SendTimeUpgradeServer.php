<?php

namespace App\Console\Commands;

use App\Events\SendTimeUpgradeServerEvent;
use Illuminate\Console\Command;

class SendTimeUpgradeServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "system:send-update";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Make client call by soket";

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
        SendTimeUpgradeServerEvent::dispatch();
    }
}
