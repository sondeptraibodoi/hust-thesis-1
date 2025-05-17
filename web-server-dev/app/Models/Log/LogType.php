<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogType extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = "l_log_types";

    protected $fillable = ["code"];

    public function logs()
    {
        return $this->hasMany(Logs::class, "log_type_id");
    }
    public function messages()
    {
        return $this->hasMany(LogMessage::class, "log_type_id");
    }
    public function message()
    {
        return $this->hasOne(LogMessage::class, "log_type_id")->latestOfMany();
    }
}
