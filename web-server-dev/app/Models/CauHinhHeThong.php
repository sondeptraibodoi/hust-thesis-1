<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CauHinhHeThong extends Model
{
    use HasFactory;

    protected $table = 'cau_hinh_he_thongs';

    protected $fillable = [
        'key',
        'value',
        'group',
        'mo_ta',
        'updated_by',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    public function nguoiCapNhat()
    {
        return $this->belongsTo(Auth\User::class, 'updated_by');
    }
}
