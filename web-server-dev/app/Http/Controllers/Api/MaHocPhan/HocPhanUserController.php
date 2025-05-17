<?php

namespace App\Http\Controllers\Api\MaHocPhan;

use App\Http\Controllers\Controller;
use App\Models\HocPhan\HocPhanUser;
use Illuminate\Http\Request;

class HocPhanUserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = HocPhanUser::query()
            ->where("user_id", $user->id)
            ->groupBy("user_id", "ma_hoc_phan");

        return $this->responseSuccess($query->get());
    }
}
