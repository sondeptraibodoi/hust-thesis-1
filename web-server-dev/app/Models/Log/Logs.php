<?php

namespace App\Models\Log;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logs extends Model
{
    use HasFactory;

    protected $table = "l_logs";

    protected $fillable = ["log_type_id", "causer_by_id", "created_at"];

    public function type()
    {
        return $this->belongsTo(LogType::class, "log_type_id");
    }

    public function causer()
    {
        return $this->belongsTo(User::class, "causer_by_id");
    }
    public function actors()
    {
        return $this->hasMany(LogActor::class, "log_id");
    }
}
