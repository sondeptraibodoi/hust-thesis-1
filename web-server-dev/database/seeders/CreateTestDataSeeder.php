<?php
namespace Database\Seeders;

use App\Constants\RoleCode;
use App\Models\Auth\User;
use App\Models\GiaoVien;
use App\Models\SinhVien;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CreateTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();
        $users = [
            [
                "username" => "administrator",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::ADMIN,
                "ma_so" => "ADM00001",
                "email" => "zoubis2001@gmail.com",
                "ho_ten" => "Administrator",
            ],
            [
                "username" => "son.ct20230999P@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::STUDENT,
                "ma_so" => "20230999P",
                "email" => "son.ct20230999P@sis.hust.edu.vn",
                "ho_ten" => "Cấn Thái Sơn",
            ],
            [
                "username" => "an.nvGV00001@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::TEACHER,
                "ma_so" => "GV00001",
                "email" => "an.nvGV00001@sis.hust.edu.vn",
                "ho_ten" => "Nguyễn Văn An",
            ],
            [
                "username" => "binh.ttGV00002@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::TEACHER,
                "ma_so" => "GV00002",
                "email" => "binh.ttGV00002@sis.hust.edu.vn",
                "ho_ten" => "Trần Thị Bình",
            ],
            [
                "username" => "chau.pmGV00003@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::TEACHER,
                "ma_so" => "GV00003",
                "email" => "chau.pmGV00003@sis.hust.edu.vn",
                "ho_ten" => "Phạm Minh Châu",
            ],
            [
                "username" => "nam.lh20230001P@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::STUDENT,
                "ma_so" => "20230001P",
                "email" => "nam.lh20230001P@sis.hust.edu.vn",
                "ho_ten" => "Lê Hoàng Nam",
            ],
            [
                "username" => "ha.vt20230002P@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::STUDENT,
                "ma_so" => "20230002P",
                "email" => "ha.vt20230002P@sis.hust.edu.vn",
                "ho_ten" => "Vũ Thu Hà",
            ],
            [
                "username" => "anh.dm20230003P@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::STUDENT,
                "ma_so" => "20230003P",
                "email" => "anh.dm20230003P@sis.hust.edu.vn",
                "ho_ten" => "Đỗ Minh Anh",
            ],
            [
                "username" => "bao.pq20230004P@sis.hust.edu.vn",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => $now,
                "updated_at" => $now,
                "vai_tro" => RoleCode::STUDENT,
                "ma_so" => "20230004P",
                "email" => "bao.pq20230004P@sis.hust.edu.vn",
                "ho_ten" => "Phạm Quốc Bảo",
            ],
        ];

        foreach ($users as $user) {
            $check = User::updateOrCreate(
                ["username" => $user["username"]],
                [
                    "email" => $user["email"],
                    "mat_khau" => $user["mat_khau"],
                    "vai_tro" => $user["vai_tro"],
                    "updated_at" => $user["updated_at"],
                    "created_at" => $user["created_at"],
                ]
            );

            if ($user["vai_tro"] === RoleCode::STUDENT) {
                SinhVien::updateOrCreate(
                    ["nguoi_dung_id" => $check->id],
                    [
                        "mssv" => $user["ma_so"],
                        "ho_ten" => $user["ho_ten"],
                        "email" => $user["email"],
                    ]
                );
            }

            if (in_array($user["vai_tro"], RoleCode::TEACHER_ROLES, true)) {
                GiaoVien::updateOrCreate(
                    ["nguoi_dung_id" => $check->id],
                    [
                        "ma_giao_vien" => $user["ma_so"],
                        "ho_ten" => $user["ho_ten"],
                        "email" => $user["email"],
                    ]
                );
            }
        }
    }
}
