<?php

namespace App\Models\HocPhan;

class HocPhanCauHoiForGiaoVien extends HocPhanCauHoi
{
    protected $fillable = [
        "noi_dung",
        "loai",
        "lua_chon",
        "loi_giai",
        "dap_an",
        "created_by_id",
        "trang_thai",
        "is_machine",
    ];
    protected $hidden = [];
}
