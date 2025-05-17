<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LogActor extends Model
{
    use HasFactory;

    protected $table = "l_log_actors";
    public $timestamps = false;
    protected $fillable = ["log_id", "log_actor_id", "log_actor_type", "subject", "subject_name"];
    protected $hidden = ["log_actor_id", "log_actor_type"];

    public function log()
    {
        return $this->belongsTo(Logs::class, "log_id");
    }
    public function actor(): MorphTo
    {
        return $this->morphTo("log_actor", "log_actor_type");
    }
}
