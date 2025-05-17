<?php

namespace App\Models\Lop;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SinhVienExtra extends Model
{
    use HasFactory;
    protected $table = "ph_lop_sinh_vien_extras";
    public function lop()
    {
        return $this->belongsTo(Lop::class, "lop_id");
    }
    public function parentLop()
    {
        return $this->belongsTo(Lop::class, "parent_lop_id");
    }
}
