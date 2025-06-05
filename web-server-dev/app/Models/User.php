<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $table = 'nguoi_dung';
    protected $primaryKey = 'nguoi_dung_id';
    public $timestamps = false;

    protected $fillable = [
        'ho_ten', 'username', 'mat_khau', 'email',
        'vai_tro', 'trang_thai', 'created_at'
    ];

    public function baiLams()
    {
        return $this->hasMany(BaiLam::class, 'nguoi_dung_id');
    }

    public function deThis()
    {
        return $this->hasMany(DeThi::class, 'nguoi_tao');
    }

    protected $hidden = [
        'password', 'remember_token',
    ];

    // Scope lọc sinh viên
    // public function scopeSinhVien($query)
    // {
    //     return $query->where('vai_tro', 'sinh_vien');
    // }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
