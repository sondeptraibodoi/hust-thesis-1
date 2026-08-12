<?php

namespace App\Http\Controllers;

use App\Traits\ResponseType;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
    use ResponseType;

    protected function perPage(Request $request, int $default = 20): int
    {
        return (int) ($request->get('per_page')
            ?? $request->get('itemsPerPage')
            ?? $request->get('perpage')
            ?? $request->get('perPage')
            ?? $default);
    }
}
