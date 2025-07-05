<?php

namespace App\Models\Auth;

use App\Constants\RoleCode;
use App\Models\User\GiaoVien;
use App\Models\User\SinhVien;
use App\Models\HocPhan\HocPhanUser;
use App\Traits\Auth\RoleTrait;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use Notifiable;
    use RoleTrait;
    use Notifiable, HasApiTokens;
    protected $table = 'nguoi_dung';
    protected static $ignoreChangedAttributes = ["mat_khau", "updated_at", "created_at"];
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        "mat_khau",
        "username",
        "ho_ten",
        "email",
        "trang_thai",
        "vai_tro",
        'avatar_url'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = ["mat_khau", "remember_token", "pivot", "role_code"];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    // protected $appends = ["roles"];
    public static function boot()
    {
        parent::boot();
    }
    public function isActive()
    {
        return $this->trang_thai;
    }
    public function isSysAdmin()
    {
        return $this->username == "administrator";
    }
}
