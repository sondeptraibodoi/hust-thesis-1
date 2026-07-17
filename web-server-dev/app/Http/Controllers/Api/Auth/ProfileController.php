<?php

namespace App\Http\Controllers\Api\Auth;

use App\Constants\Regex;
use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\RegisterRequest;
use App\Models\Auth\User;
use App\Models\GiaoVien;
use App\Models\SinhVien;
use Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use App\Http\Resources\User as UserResource;
use App\Traits\ResponseType;
use Auth;
use Illuminate\Foundation\Http\FormRequest;
use Storage;

/**
 * Class ChangePasswordRequest.
 */
class UpdatePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            "password" => "required|min:8|confirmed",
        ];
    }
}
class ProfileController extends Controller
{
    use ResponseType;
    /**
     * Get the guard to be used during authentication.
     *
     */
    public function guard()
    {
        return Auth::guard();
    }
    public function me(Request $request)
    {
        $user = User::with(['sinhVien.lopHanhChinh', 'giaoVien.lopChuNhiems', 'giaoVien.lopHocPhans'])
            ->findOrFail($request->user()->id);

        $this->ensureAcademicProfile($user);

        $user->load(['sinhVien.lopHanhChinh', 'giaoVien.lopChuNhiems', 'giaoVien.lopHocPhans']);

        return response()->json([
            "user" => $user,
        ]);
    }

    private function ensureAcademicProfile(User $user): void
    {
        if ($user->vai_tro === RoleCode::STUDENT && !$user->sinhVien) {
            $email = $this->profileEmail($user);
            $profile = SinhVien::where('email', $email)->first();

            if ($profile) {
                $profile->update(['nguoi_dung_id' => $user->id]);
                return;
            }

            SinhVien::create([
                'nguoi_dung_id' => $user->id,
                'mssv' => $this->uniqueStudentCode($user),
                'ho_ten' => $this->profileName($user),
                'email' => $email,
            ]);
        }

        if (in_array($user->vai_tro, RoleCode::TEACHER_ROLES, true) && !$user->giaoVien) {
            $email = $this->profileEmail($user);
            $profile = GiaoVien::where('email', $email)->first();

            if ($profile) {
                $profile->update(['nguoi_dung_id' => $user->id]);
                return;
            }

            GiaoVien::create([
                'nguoi_dung_id' => $user->id,
                'ma_giao_vien' => $this->uniqueTeacherCode($user),
                'ho_ten' => $this->profileName($user),
                'email' => $email,
            ]);
        }
    }

    private function profileEmail(User $user): string
    {
        return $user->email ?: $user->username;
    }

    private function profileName(User $user): string
    {
        return $user->ho_ten ?: strtok($this->profileEmail($user), '@') ?: $user->username;
    }

    private function uniqueStudentCode(User $user): string
    {
        $emailName = strtok($this->profileEmail($user), '@') ?: '';
        preg_match('/\d+/', $emailName, $matches);
        $code = $matches[0] ?? 'SV' . $user->id;

        if (!SinhVien::where('mssv', $code)->exists()) {
            return $code;
        }

        return $code . '-' . $user->id;
    }

    private function uniqueTeacherCode(User $user): string
    {
        $code = 'GV' . $user->id;

        if (!GiaoVien::where('ma_giao_vien', $code)->exists()) {
            return $code;
        }

        return $code . '-' . time();
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $atts = $request->only("old_password", "password");
        $user = $request->user();
        if (Hash::check($atts["old_password"], $user->mat_khau)) {
            $user->mat_khau = bcrypt($request->input("password"));
            $user->save();
        } else {
            return response()->json(
                [
                    "status_code" => 422,
                    "errors" => [
                        "old_password" => ["Mật khẩu nhập không khớp với mật khẩu hiện tại của bạn."],
                    ],
                    "message" => "422 Unprocessable Entity",
                ],
                422
            );
        }

        return response()->json([
            "status_code" => 200,
            "message" => "Changed password successful!",
        ]);
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();
        $info = $request->all();
        $request->validate([]);
        $disk = Storage::disk("local");
        // $user = $request->user();
        if ($request->has("avatar")) {
            $file = $request->file("avatar");
            if ($disk->exists($user->avatar)) {
                $disk->delete($user->avatar);
            }
            $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $fileName = $fileName . "-" . time() . "." . $file->getClientOriginalExtension();
            $file->move($disk->path("public/images/avatar/"), $fileName);
            $user->avatar_url = "/storage/images/avatar/" . $fileName;
        }
        if (isset($info["email"])) {
            $user->update(["username" => $info["email"]]);
        }
        if (isset($user)) {
            $user->update($info);
        } elseif ($user->role_code == RoleCode::STUDENT) {
            $user->create($info);
        }

        try {
            $user->save();
        } catch (\Exception $e) {
            throw $e;
        }
        return response()->json([
            "status_code" => 200,
            "message" => "Updated Profile",
            "data" => new \App\Http\Resources\Profile($user),
        ]);
    }
    function checkEmail($str)
    {
        $regex = '/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/';
        if (preg_match($regex, $str)) {
            return true;
        }
        return false;
    }

    public function register(RegisterRequest $request)
    {
        $user = User::create([
            "name" => $request->name,
            "username" => $request->username,
            "mobile" => $request->mobile,
            "email" => $request->email,
            "password" => Hash::make($request->password),
        ]);
        $user->syncRole("access:user");

        event(new Registered($user));

        return $this->responseSuccess([], "User Registered");
    }

    public function checkToken()
    {
        // Middleware auth:sanctum will handle logic for this method

        return response()->json([
            "isValid" => true,
        ]);
    }
}
