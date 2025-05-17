<?php

namespace App\Models\HocPhan;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocPhanUser extends Model
{
    use HasFactory;
    protected $table = "hp_user";
    protected $fillable = ["user_id", "ma_hoc_phan"];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }
    public $timestamps = false;
}
