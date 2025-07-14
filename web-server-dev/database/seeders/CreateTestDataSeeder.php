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
        $users = [
            [
                "username" => "administrator",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::ADMIN,
                'email' => "zoubis2001@gmail.com",
                'ho_ten' => 'Administrator'
            ],
            [
                "username" => "sinhvien@hust.com",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::STUDENT,
                'email' => "sinhvien@hust.com",
                'ho_ten' => 'Sinh viên'
            ],
            [
                "username" => "giaovien@hust.com",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::TEACHER,
                "email" => "giaovien@hust.com",
                'ho_ten' => 'Giáo Viên'
            ],
            [
                "username" => "student@hust.com",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::STUDENT,
                "email" => "student@hust.com",
                'ho_ten' => 'Sinh viên 1'
            ],
            [
                "username" => "student2@hust.com",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::STUDENT,
                "email" => "student2@hust.com",
                'ho_ten' => 'Sinh viên 2'
            ],
            [
                "username" => "student3@hust.com",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::STUDENT,
                "email" => "student3@hust.com",
                'ho_ten' => 'Sinh viên 3'
            ],
            [
                "username" => "student4@hust.com",
                "mat_khau" => bcrypt("12345678"),
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
                "vai_tro" => RoleCode::STUDENT,
                "email" => "student4@hust.com",
                'ho_ten' => 'Sinh viên 4'
            ],
        ];
        foreach ($users as $user) {
            $check = User::where("username", $user["username"])->first();
            if (!empty($check)) {
                $check->update([
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'mat_khau' => $user['mat_khau'],
                    'vai_tro' => $user['vai_tro'],
                    'updated_at' => $user['updated_at'],
                    'created_at' => $user['created_at'],
                ]);
            } else {
                $check = User::create([
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'mat_khau' => $user['mat_khau'],
                    'vai_tro' => $user['vai_tro'],
                    'updated_at' => $user['updated_at'],
                    'created_at' => $user['created_at'],
                ]);
                if($user['vai_tro'] === RoleCode::STUDENT) {
                    SinhVien::create([
                        'mssv' => (string) mt_rand(10000000, 99999999),
                        'nguoi_dung_id' => $check->id,
                        'ho_ten' => $user['ho_ten'],
                        'email' => $user['email'],
                    ]);
                }
                if($user['vai_tro'] === RoleCode::TEACHER) {
                    GiaoVien::create([
                        'nguoi_dung_id' => $check->id,
                        'ho_ten' => $user['ho_ten'],
                        'email' => $user['email'],
                    ]);
                }
            }
        }

    }
}
