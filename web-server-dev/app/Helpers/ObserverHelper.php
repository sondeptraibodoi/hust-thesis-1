<?php

namespace App\Helpers;

class ObserverHelper
{
    protected static $observers = [

    ];

    public static function register()
    {
        foreach (self::$observers as $model => $observer) {
            $model::observe($observer);
        }
    }
}
