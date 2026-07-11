<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class SettingController extends Controller
{
    public function indexPusher()
    {
        return $this->responseSuccess([
            'key' => config('broadcasting.connections.pusher.key'),
            'cluster' => config('broadcasting.connections.pusher.options.cluster'),
        ]);
    }
}
