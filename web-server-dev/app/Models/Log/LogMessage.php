<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogMessage extends Model
{
    use HasFactory;

    protected $table = "l_log_messages";
    public $timestamps = false;
    protected $fillable = ["log_type_id", "message"];

    public function logType()
    {
        return $this->belongsTo(LogType::class, "log_type_id");
    }
}
