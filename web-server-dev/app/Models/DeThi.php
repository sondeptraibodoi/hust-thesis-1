<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeThi extends Model
{
    use HasFactory;

    protected $table = 'de_thi';

    protected $primaryKey = 'id'; // nếu không phải 'id', bạn cần khai báo

    protected $fillable = [
        'ten_de_thi',
        'mo_ta',
        'thoi_gian_lam_bai', // tính theo phút
        'mon_hoc_id',         // liên kết đến bảng monhoc
        'trang_thai',         // ví dụ: 'hoat_dong', 'tam_khoa'
    ];

    // Một đề thi thuộc về một môn học
    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'mon_hoc_id');
    }

    // Một đề thi có nhiều câu hỏi qua bảng chi tiết đề thi
    public function cauHoi()
    {
        return $this->belongsToMany(CauHoi::class, 'chitietdethi', 'de_thi_id', 'cau_hoi_id');
    }

    // Có thể thêm quan hệ đến Bài làm nếu cần
    public function baiLam()
    {
        return $this->hasMany(BaiLam::class, 'de_thi_id');
    }
}
