<?php

namespace Database\Seeders;

use App\Models\MonHoc;
use Illuminate\Database\Seeder;

class CreateMonHocSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $courses = [
            ['ma' => 'ET2072', 'ten_mon_hoc' => 'Lý thuyết thông tin', 'so_tin_chi' => 2],
            ['ma' => 'ET3220', 'ten_mon_hoc' => 'ĐIỆN TỬ SỐ', 'so_tin_chi' => 3],
            ['ma' => 'ET3280', 'ten_mon_hoc' => 'Anten và truyền sóng', 'so_tin_chi' => 2],
            ['ma' => 'ET4900', 'ten_mon_hoc' => 'Đồ án tốt nghiệp cử nhân', 'so_tin_chi' => 6],
            ['ma' => 'ET3300', 'ten_mon_hoc' => 'Kỹ thuật vi xử lý', 'so_tin_chi' => 3],
            ['ma' => 'ET3310', 'ten_mon_hoc' => 'Lý thuyết mật mã', 'so_tin_chi' => 3],
            ['ma' => 'ET4010', 'ten_mon_hoc' => 'Đồ án thiết kế II', 'so_tin_chi' => 2],
            ['ma' => 'ET4020', 'ten_mon_hoc' => 'Xử lý tín hiệu số', 'so_tin_chi' => 3],
            ['ma' => 'ET4070', 'ten_mon_hoc' => 'Cơ sở truyền số liệu', 'so_tin_chi' => 3],
            ['ma' => 'ET4230', 'ten_mon_hoc' => 'MẠNG MÁY TÍNH', 'so_tin_chi' => 3],
            ['ma' => 'ET4250', 'ten_mon_hoc' => 'Hệ thống viễn thông', 'so_tin_chi' => 3],
            ['ma' => 'ET4291', 'ten_mon_hoc' => 'Hệ điều hành', 'so_tin_chi' => 3],
            ['ma' => 'ET2080', 'ten_mon_hoc' => 'Cơ sở kỹ thuật đo lường', 'so_tin_chi' => 2],
            ['ma' => 'ET3230', 'ten_mon_hoc' => 'Điện tử tương tự I', 'so_tin_chi' => 3],
            ['ma' => 'ET3241', 'ten_mon_hoc' => 'ĐIỆN TỬ TƯƠNG TỰ II', 'so_tin_chi' => 2],
            ['ma' => 'ET3250', 'ten_mon_hoc' => 'Thông tin số', 'so_tin_chi' => 3],
            ['ma' => 'ET3260', 'ten_mon_hoc' => 'KỸ THUẬT PHẦN MỀM ỨNG DỤNG', 'so_tin_chi' => 2],
            ['ma' => 'ET3290', 'ten_mon_hoc' => 'Đồ án thiết kế I', 'so_tin_chi' => 2],
            ['ma' => 'ET2000', 'ten_mon_hoc' => 'Nhập môn kỹ thuật điện tử-viễn thông', 'so_tin_chi' => 2],
            ['ma' => 'ET2021', 'ten_mon_hoc' => 'Thực tập cơ bản', 'so_tin_chi' => 2],
            ['ma' => 'ET2031', 'ten_mon_hoc' => 'Kỹ thuật lập trình C/C++', 'so_tin_chi' => 2],
            ['ma' => 'ET2040', 'ten_mon_hoc' => 'Cấu kiện điện tử', 'so_tin_chi' => 3],
            ['ma' => 'ET2050', 'ten_mon_hoc' => 'Lý thuyết mạch', 'so_tin_chi' => 3],
            ['ma' => 'ET2060', 'ten_mon_hoc' => 'Tín hiệu và hệ thống', 'so_tin_chi' => 3],
            ['ma' => 'ET2100', 'ten_mon_hoc' => 'Cấu trúc dữ liệu và giải thuật', 'so_tin_chi' => 2],
            ['ma' => 'ET3210', 'ten_mon_hoc' => 'Trường Điện Từ', 'so_tin_chi' => 3],
        ];

        foreach ($courses as $course) {
            MonHoc::updateOrCreate(
                ['ma' => $course['ma']],
                [
                    'ten_mon_hoc' => $course['ten_mon_hoc'],
                    'so_tin_chi' => $course['so_tin_chi'],
                    'diem_qua_mon' => 4,
                    'bat_buoc' => true,
                    'trang_thai' => 'dang_mo',
                ]
            );
        }
    }
}
