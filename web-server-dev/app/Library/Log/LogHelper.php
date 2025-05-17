<?php

namespace App\Library\Log;

use App\Models\Auth\User;
use App\Models\Log\LogActor;
use App\Models\Log\Logs;
use App\Models\Log\LogType;

class LogHelper
{
    private $log;
    public static function fromType(string $type_str): self
    {
        $type = LogType::where("code", $type_str)->first();
        if (empty($type)) {
            abort(500, "Chưa khai báo loại: " . $type_str);
        }
        $log = new Logs(["log_type_id" => $type->id]);
        return new static($log);
    }
    public function __construct(Logs $log)
    {
        $this->log = $log;
    }
    public function causerBy(User $user)
    {
        $this->log->causer_by_id = $user->getKey();
        return $this;
    }
    public function withActor($model, string $subject, string $subject_name = "")
    {
        $actor = new LogActor();
        $actor->actor()->associate($model);
        $actor->subject = $subject;
        $actor->subject_name = $subject_name;
        $actor->log()->associate($this->log);
        $this->log->actors->add($actor);
        return $this;
    }
    public function setProperties(array $properties)
    {
        $this->log->properties = json_encode($properties);
        return $this;
    }
    public function save()
    {
        $this->log->save();
        $this->log->actors->each(function ($actor) {
            $actor->log_id = $this->log->getKey();
            $actor->save();
        });
        return $this->log;
    }
}
