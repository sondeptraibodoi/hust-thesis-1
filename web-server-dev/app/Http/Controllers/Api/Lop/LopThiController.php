<?php

namespace App\Http\Controllers\Api\Lop;

use App\Constants\RoleCode;
use App\Http\Controllers\Controller;
use App\Jobs\SendMailTrongThiGV;
use App\Models\Lop\LopThi;
use Illuminate\Http\Request;
use App\Library\QueryBuilder\QueryBuilder;
use App\Library\QueryBuilder\Filters\AllowedFilter;
use App\Library\QueryBuilder\Filters\Custom\FilterRelation;
use App\Mail\MailNotify;
use App\Mail\MailNotifyTrongThiGV;
use App\Models\Diem\Diem;
use App\Models\Diem\DiemNhanDienLopThi;
use App\Models\Lop\LopGiaoVien;
use App\Models\Lop\LopThiGiaoVien;
use App\Models\Lop\LopThiSinhVien;
use App\Models\User\GiaoVien;
use Carbon\Carbon;
use DB;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\Log;
use Mail;
use Spatie\ResponseCache\Facades\ResponseCache;

class LopThiController extends Controller
{
    protected $includes = ["lop", "sinhViens", "lopThiSinhVien"];
    public function index(Request $request)
    {
        $query = LopThi::query()->with("lop", "lopThiSinhVien")->withCount("diems");
        $query = DB::table("d_diem_nhan_dien_lop_this")
            ->rightJoinSub($query, "query", function (JoinClause $join) {
                $join->on("d_diem_nhan_dien_lop_this.lop_thi_id", "=", "query.id");
                $join->where("query.diems_count", "=", 0);
            })
            ->select(
                "d_diem_nhan_dien_lop_this.id as id_nhan_dien",
                "d_diem_nhan_dien_lop_this.bang_diem_id",
                "query.*"
            );
        $query = QueryBuilder::for($query, $request)
            ->allowedIncludes($this->includes)
            ->allowedFilters(["lop_id"])
            ->allowedSorts(["lop_id"])
            ->allowedPagination();
        return response()->json(
            new \App\Http\Resources\Items($query->orderBy("ngay_thi")->orderBy("ma")->paginate()),
            200,
            []
        );
    }

    public function LopThiFilter(Request $request)
    {
        $query = LopThi::query()->with("lop");
        $query = QueryBuilder::for($query, $request)
            ->with("lop")
            ->allowedSearch("ma")
            ->defaultSort("id")
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function show(Request $request, $id)
    {
        $query = LopThi::query();
        $query = QueryBuilder::for($query, $request)->allowedIncludes($this->includes);
        return response()->json($query->findOrFail($id), 200, []);
    }
    public function indexAgGrid(Request $request)
    {
        $query = LopThi::query();
        $query = DB::query()->fromSub(function ($query) {
            $query->from("ph_lop_this")->join("ph_lops", "ph_lop_this.lop_id", "=", "ph_lops.id");
            $query->orderBy("ph_lop_this.id");
            $query->select([
                "ph_lop_this.id",
                "ph_lop_this.lop_id",
                DB::raw("ph_lops.ma as ma_lop"), //lop
                DB::raw("ph_lop_this.ma as ma_lop_thi"), //lop thi
                "ph_lops.ma_hp",
                "ph_lops.ten_hp",
                "ph_lop_this.phong_thi",
                "ph_lops.ki_hoc",
                "ph_lop_this.loai",
                "ph_lop_this.ngay_thi",
                "ph_lop_this.kip_thi",
            ]);
        }, "lop_this");
        $query = QueryBuilder::for($query, $request)->allowedAgGrid([])->defaultSort("id")->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function store(Request $request)
    {
        $lopId = $request->input("ma");
        $loai = $request->input("loai");
        if (!empty($lopId) && !empty($loai)) {
            $exists = DB::table("ph_lop_this")->where("ma", $lopId)->where("loai", $loai)->exists();
            if (!empty($exists)) {
                return response()->json(["message" => "Mã lớp thi và đợt thi đã tồn tại"], 422);
            }
        }
        $listLoaiThi = ["GK", "GK2", "CK"];
        $request->validate(
            [
                "lop_id" => "required|integer",
                "ma" => "required",
                "loai" => [
                    "required",
                    function ($attribute, $value, $fail) use ($listLoaiThi) {
                        if (!in_array($value, $listLoaiThi)) {
                            $fail("Đợt thi không tồn tại.");
                        }
                    },
                ],
            ],
            [
                "required" => "Hãy nhập thông tin cho trường :attribute",
            ],
            [
                "ma" => "Mã lớp thi",
                "loai" => "Đợt thi",
            ]
        );
        $data = $request->all();
        $result = LopThi::create($data);
        ResponseCache::clear();
        return $this->responseSuccess($result);
    }
    public function update(Request $request, $id)
    {
        $listLoaiThi = ["GK", "GK2", "CK"];
        $request->validate(
            [
                "lop_id" => ["required", "integer"],
                "ma" => [
                    "required",
                    function ($attribute, $value, $fail) use ($id) {
                        $lop_thi = LopThi::findOrFail($id);
                        if ($lop_thi->ma != $value) {
                            $fail("Mã lớp thi không thể thay đổi.");
                        }
                    },
                ],
                "loai" => [
                    "required",
                    function ($attribute, $value, $fail) use ($listLoaiThi) {
                        if (!in_array($value, $listLoaiThi)) {
                            $fail("Đợt thi không tồn tại.");
                        }
                    },
                ],
            ],
            [
                "required" => "Hãy nhập thông tin cho trường :attribute",
            ],
            [
                "ma" => "Mã lớp thi",
                "loai" => "Đợt thi",
            ]
        );

        $exists = DB::table("ph_lop_this")
            ->where("ma", $request->ma)
            ->where("loai", $request->loai)
            ->where("id", "<>", $id)
            ->exists();
        if (!empty($exists)) {
            return response()->json(["message" => "Mã lớp thi và đợt thi đã tồn tại"], 422);
        }

        $data = $request->only(["ma", "loai", "ngay_thi", "kip_thi", "phong_thi", "lop_id"]);
        $lop_thi = LopThi::findOrFail($id);
        $result = $lop_thi->update($data);
        ResponseCache::clear();
        return $this->responseSuccess($result);
    }
    public function destroy($id)
    {
        $lop_thi = LopThi::findOrFail($id);
        $result = $lop_thi->delete($lop_thi);
        ResponseCache::clear();
        return $this->responseSuccess($result);
    }
    public function LopThiMon(Request $request, $id)
    {
        $user = $request->user();
        $query = DiemNhanDienLopThi::join(
            "ph_lop_this",
            "ph_lop_this.id",
            "=",
            "d_diem_nhan_dien_lop_this.lop_thi_id"
        )->join("ph_lops", "ph_lops.id", "=", "ph_lop_this.lop_id");
        $query->with("lopThi.lop.giaoViens");
        if ($user->allow(RoleCode::TEACHER) && !$user->allow(RoleCode::ASSISTANT)) {
            $query
                ->join("ph_lop_giao_viens", "ph_lops.id", "=", "ph_lop_giao_viens.lop_id")
                ->select("ph_lop_giao_viens.giao_vien_id")
                ->where("ph_lop_giao_viens.giao_vien_id", $user->info->id);
        }
        $query
            ->where("d_diem_nhan_dien_lop_this.bang_diem_id", $id)
            ->select(
                "d_diem_nhan_dien_lop_this.id",
                "d_diem_nhan_dien_lop_this.page",
                "ph_lop_this.ma",
                "ph_lop_this.loai",
                "ph_lops.ma_hp",
                "ph_lops.ki_hoc",
                "ph_lop_this.lop_id",
                DB::raw("ph_lop_this.id as lop_thi_id"),
                DB::raw("ph_lops.ma as ma_lop"),
                DB::raw("ph_lop_this.ma as ma_lop_thi")
            )
            ->withCount([
                "diems",
                "diems as diem_count_not_null" => function ($query) {
                    $query->select(\DB::raw("count(*)"))->whereNotNull("diem");
                },
                "diems as diem_count_null" => function ($query) {
                    $query->select(\DB::raw("count(*)"))->whereNull("diem");
                },
            ]);
        $query = QueryBuilder::for($query, $request)
            ->defaultSort("id")
            ->allowedAgGrid()
            ->allowedFilters([AllowedFilter::custom("ph_lop_this", new FilterRelation("lopThi", "id"))])
            ->allowedPagination();

        return response()->json(
            new \App\Http\Resources\Items(
                $query
                    ->orderByRaw(
                        "NULLIF(case WHEN strpos( page,',') =0 Then page else left(page,strpos( page,',')-1) end,'')::int asc"
                    )
                    ->get()
            ),
            200,
            []
        );
    }
    public function cacheLopThiMon($id)
    {
        $query = DiemNhanDienLopThi::query()->where("bang_diem_id", $id)->with("lopThi.lop.giaoViens");
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }
    public function LoaiLopThi()
    {
        $loai_lop_thi = [
            [
                "title" => "Giữa kỳ",
                "value" => "GK",
            ],
            [
                "title" => "Giữa kỳ lần 2",
                "value" => "GK2",
            ],
            [
                "title" => "Cuối kỳ",
                "value" => "CK",
            ],
            [
                "title" => "Thi bù - Giữa kỳ",
                "value" => "TB-GK",
            ],
            [
                "title" => "Thi bù - Giữa kỳ lần 2",
                "value" => "TB-GK2",
            ],
            // [
            //     "title" => "Thi bù - Cuối kỳ",
            //     "value" => "TB-CK"
            // ]
        ];
        return response()->json($loai_lop_thi);
    }

    public function lopThiGiaoVien($id)
    {
        $query = DB::table("ph_lops")
            ->join("ph_lop_giao_viens", "ph_lops.id", "=", "ph_lop_giao_viens.lop_id")
            ->join("ph_lop_this", "ph_lops.id", "=", "ph_lop_this.lop_id")
            ->where("ph_lop_giao_viens.giao_vien_id", "=", $id);
        $query->select([
            "ph_lop_this.id",
            "ph_lop_this.lop_id",
            "ph_lop_giao_viens.giao_vien_id",
            "ph_lops.ki_hoc",
            "ph_lops.ma_hp",
            "ph_lop_this.loai",
            "ph_lop_this.ma",
            "ph_lop_this.ngay_thi",
            "ph_lop_this.phong_thi",
            "ph_lop_this.kip_thi",
        ]);

        return $this->responseSuccess($query->get());
    }
    public function lopThiKi(Request $request)
    {
        $query = DB::query()->fromSub(function ($query) use ($request) {
            $query
                ->from("ph_lop_this")
                ->join("ph_lops", "ph_lops.id", "=", "ph_lop_this.lop_id")
                ->leftJoin(
                    DB::raw(
                        "(SELECT COUNT(sinh_vien_id) as sl_sinh_vien, lop_thi_id FROM ph_lop_thi_sinh_viens GROUP BY lop_thi_id) as c"
                    ),
                    "ph_lop_this.id",
                    "=",
                    "c.lop_thi_id"
                )
                ->orderBy("ph_lop_this.phong_thi", "asc")
                ->orderBy("ph_lop_this.ma", "asc");
            $query->select([
                "ph_lop_this.loai",
                "ph_lop_this.lop_id",
                "ph_lop_this.id as lop_thi_id",
                "ph_lops.ki_hoc",
                "ph_lops.ma_hp",
                "ph_lop_this.loai",
                "ph_lop_this.ma",
                "ph_lop_this.ngay_thi",
                "ph_lop_this.phong_thi",
                "ph_lop_this.kip_thi",
                "c.sl_sinh_vien",
            ]);
            if (!empty($request["loai"])) {
                $query->where("ph_lop_this.loai", $request["loai"]);
            }
            if (!empty($request["ki_hoc"])) {
                $query->where("ph_lops.ki_hoc", $request["ki_hoc"]);
            }
            if (!empty($request["is_dai_cuong"])) {
                if ($request["is_dai_cuong"] === 1) {
                    $query->where("ph_lops.is_dai_cuong", true);
                } else {
                    $query->where("ph_lops.is_dai_cuong", false);
                }
            }
            $query->whereNotNull("ph_lop_this.ngay_thi");
            $query->whereNotNull("ph_lop_this.kip_thi")->where("ph_lop_this.kip_thi", "!=", "");
        }, "lop_this");
        $query_gv = DB::query()->fromSub(function ($query) use ($request) {
            $query
                ->from("ph_lop_thi_giao_viens")
                ->join("u_giao_viens", "u_giao_viens.id", "=", "ph_lop_thi_giao_viens.giao_vien_id");
            $query->select([
                "u_giao_viens.id",
                "u_giao_viens.name",
                "u_giao_viens.email",
                "ph_lop_thi_giao_viens.lop_thi_id",
            ]);
        }, "lop_this");
        $items = $query->get();
        $items_gv = [];
        foreach ($query_gv->get() as $key => $item_gv) {
            $items_gv[$item_gv->lop_thi_id][] = [
                "id" => $item_gv->id,
                "name" => $item_gv->name,
                "email" => $item_gv->email,
            ];
        }
        $items = array_map(function ($item) use ($items_gv) {
            if (isset($items_gv[$item->lop_thi_id])) {
                $item->giao_viens = $items_gv[$item->lop_thi_id];
            } else {
                $item->giao_viens = [];
            }
            return $item;
        }, $items->toArray());
        $items = collect($items);
        return response()->json(new \App\Http\Resources\Items($items), 200, []);
    }

    public function giaoVienTrongThiSendMail(Request $request)
    {
        $data = $request->all();
        $ki_hoc = $data["ki_hoc"];
        $loai = $data["loai"];
        $ngay_thi = $data["ngay_thi"] ?? null;
        $kip_thi = $data["kip_thi"] ?? null;
        $is_dai_cuong = null;
        if ($request->has("lop")) {
            $is_dai_cuong = $request->get("lop") === 1 ?? false;
        }

        $title = $data["title"] ?? "Lịch coi thi";
        $query = GiaoVien::whereHas("lopTrongThi", function ($query) use (
            $ki_hoc,
            $loai,
            $is_dai_cuong,
            $kip_thi,
            $ngay_thi
        ) {
            $query->whereHas("lop", function ($query) use ($ki_hoc, $is_dai_cuong) {
                $query->where("ki_hoc", $ki_hoc);
                if (isset($is_dai_cuong)) {
                    $query->where("ph_lops.is_dai_cuong", $is_dai_cuong);
                }
            });
            $query->where("loai", $loai);
            if (isset($kip_thi)) {
                $query->where("kip_thi", $kip_thi);
            }
            if (isset($ngay_thi)) {
                $query->where("ngay_thi", $ngay_thi);
            }
        })->with([
            "lopTrongThi" => function ($query) use ($ki_hoc, $loai, $is_dai_cuong, $kip_thi, $ngay_thi) {
                $query->whereHas("lop", function ($query) use ($ki_hoc, $is_dai_cuong) {
                    $query->where("ki_hoc", $ki_hoc);
                    if (isset($is_dai_cuong)) {
                        $query->where("ph_lops.is_dai_cuong", $is_dai_cuong);
                    }
                });
                $query->where("loai", $loai);
                if (isset($kip_thi)) {
                    $query->where("kip_thi", $kip_thi);
                }
                if (isset($ngay_thi)) {
                    $query->where("ngay_thi", $ngay_thi);
                }
                $query->orderBy("ngay_thi");
                $query->orderBy("kip_thi");
            },
            "lopTrongThi.lop",
        ]);
        $giao_viens = $query->get();
        foreach ($giao_viens as $item) {
            $lop_this = [];
            $giao_vien_email = $item["email"];
            if (config("app.debug")) {
                $giao_vien_email = "hungpv.mattech@gmail.com";
            }
            foreach ($item["lopTrongThi"] as $lop_thi) {
                $ngaythi = $lop_thi->ngay_thi;
                if ($ngaythi < Carbon::now()) {
                    continue;
                }
                $ngaythi = $lop_thi->getRawOriginal("ngay_thi");
                $lop_thi = $lop_thi->toArray();
                $lop_this[] = [
                    "ma_lop" => $lop_thi["lop"]["ma"] ?? "",
                    "ma_lop_thi" => $lop_thi["ma"] ?? "",
                    "ngay_thi" => $ngaythi,
                    "kip_thi" => $lop_thi["kip_thi"],
                    "phong_thi" => $lop_thi["phong_thi"],
                ];
            }
            if (count($lop_this) > 0) {
                $info_email =
                    "SEND MAIL NOTIFY - GIAO VIEN LOP THI - TITLE: " .
                    $title .
                    " - EMAIL: " .
                    $giao_vien_email .
                    " - DATE: " .
                    Carbon::now()->format("Y-m-d-hh-mm-ss");
                Log::channel("email")->debug($info_email);
                Mail::to($giao_vien_email)->queue(new MailNotifyTrongThiGV($lop_this, $item, $title));
            }
        }
        return $this->responseSuccess($giao_viens);
    }
    public function giaoVienTrongThiSave(Request $request)
    {
        $data = $request->all();
        $ki_hoc = $request->get("ki_hoc");
        $loai = $request->get("loai");
        $query = LopThi::join("ph_lops", "ph_lop_this.lop_id", "=", "ph_lops.id")->where(
            "ph_lop_this.loai",
            $data["loai"]
        );
        if ($request->has("lop")) {
            $lop = $request->get("lop") === 1 ?? false;
            $query->where("ph_lops.is_dai_cuong", $lop);
        }
        $lop_this = $query->get(["ph_lop_this.id", "ph_lop_this.ma"])->mapWithKeys(function ($item, $key) {
            return [$item["ma"] => $item["id"]];
        });
        $lop_thi_gv = LopThiGiaoVien::join("ph_lop_this", "ph_lop_this.id", "=", "ph_lop_thi_giao_viens.lop_thi_id")
            ->join("ph_lops", "ph_lops.id", "=", "ph_lop_this.lop_id")
            ->where("ph_lops.ki_hoc", $ki_hoc)
            ->where("ph_lop_this.loai", $loai);
        if ($request->has("lop")) {
            $lop = $request->get("lop") === 1 ?? false;
            $lop_thi_gv->where("ph_lops.is_dai_cuong", $lop);
        }
        if ($lop_thi_gv->get()->toArray()) {
            $lop_thi_gv->delete();
        }
        foreach ($data["info"] as $item) {
            $giao_vien_id = $item["giao_vien_id"];
            foreach ($item["lop_thi"] as $lop_thi) {
                LopThiGiaoVien::create([
                    "lop_thi_id" => $lop_this[$lop_thi["ma_lop_thi"]],
                    "giao_vien_id" => $giao_vien_id,
                ]);
            }
        }
    }
    public function giaoVienTrongThi(Request $request)
    {
        $data = $request->all();
        $ki_hoc = $data["ki_hoc"];
        $loai = $data["loai"];
        $title = $data["title"] ?? "Lịch coi thi";

        $query = LopThi::join("ph_lops", "ph_lop_this.lop_id", "=", "ph_lops.id")->where(
            "ph_lop_this.loai",
            $data["loai"]
        );
        if (!empty($data["lop"])) {
            $lop = $data["lop"] === 1 ?? false;
            $query->where("ph_lops.is_dai_cuong", $lop);
        }
        $lop_this = $query->get(["ph_lop_this.id", "ph_lop_this.ma"])->mapWithKeys(function ($item, $key) {
            return [$item["ma"] => $item["id"]];
        });
        $lop_thi_gv = LopThiGiaoVien::join("ph_lop_this", "ph_lop_this.id", "=", "ph_lop_thi_giao_viens.lop_thi_id")
            ->join("ph_lops", "ph_lops.id", "=", "ph_lop_this.lop_id")
            ->where("ph_lops.ki_hoc", $ki_hoc)
            ->where("ph_lop_this.loai", $loai);
        if (!empty($data["lop"])) {
            $lop = $data["lop"] === 1 ?? false;
            $lop_thi_gv->where("ph_lops.is_dai_cuong", $lop);
        }
        if ($lop_thi_gv->get()->toArray()) {
            $lop_thi_gv->delete();
        }
        foreach ($data["info"] as $item) {
            $giao_vien_id = $item["giao_vien_id"];
            $giao_vien_email = $item["email"];
            if (config("app.debug")) {
                $giao_vien_email = "lvt888664@gmail.com";
            }
            $cache_ngay_thi = [];
            $items_send = [];
            foreach ($item["lop_thi"] as $lop_thi) {
                $ngaythi = Carbon::parse($lop_thi["ngay_thi"]);
                if ($ngaythi >= Carbon::now()) {
                    $cache_ngay_thi[] = $ngaythi;
                    $items_send[] = $lop_thi;
                }
                LopThiGiaoVien::create([
                    "lop_thi_id" => $lop_this[$lop_thi["ma_lop_thi"]],
                    "giao_vien_id" => $giao_vien_id,
                ]);
            }
            if (count($cache_ngay_thi) > 0) {
                Mail::to($giao_vien_email)->queue(new MailNotifyTrongThiGV($items_send, $item, $title));
            }
        }
        return $this->responseSuccess();
    }

    public function lopCoiThiGiaoVienDetail(Request $request)
    {
        $ki_hoc = $request->get("ki_hoc");
        $giao_vien_id = $request->get("giao_vien_id");
        $loai = $request->get("loai");
        $query = LopThiGiaoVien::join("ph_lop_this", "ph_lop_thi_giao_viens.lop_thi_id", "=", "ph_lop_this.id")
            ->join("ph_lops", "ph_lop_this.lop_id", "=", "ph_lops.id")
            ->join("u_giao_viens", "ph_lop_thi_giao_viens.giao_vien_id", "=", "u_giao_viens.id")
            ->orderBy("ph_lop_this.phong_thi", "asc")
            ->orderBy("ph_lop_this.ngay_thi", "asc");
        $query
            ->select(
                "u_giao_viens.name",
                "ph_lop_thi_giao_viens.giao_vien_id",
                "ph_lop_thi_giao_viens.lop_thi_id",
                "ph_lop_this.phong_thi",
                "ph_lop_this.kip_thi",
                "ph_lop_this.ngay_thi",
                "ph_lops.ki_hoc",
                "ph_lop_this.loai",
                DB::raw("ph_lop_this.ma as ma_lop_thi"),
                DB::raw("ph_lops.ma as ma_lop_hoc"),
                DB::raw("ph_lops.id as lop_id"),
                DB::raw("ph_lop_this.id as lop_thi_id")
            )
            ->where("ph_lops.ki_hoc", $ki_hoc);
        if (!empty($loai)) {
            $query->where("ph_lop_this.loai", $loai);
        }
        if (!empty($giao_vien_id)) {
            $query->where("ph_lop_thi_giao_viens.giao_vien_id", $giao_vien_id);
        }
        if (!empty($request["ngay_thi"])) {
            $query->where("ph_lop_this.ngay_thi", $request["ngay_thi"]);
        }
        if (!empty($request["kip_thi"])) {
            $query->where("ph_lop_this.kip_thi", $request["kip_thi"]);
        }
        return $this->responseSuccess($query->get());
    }

    public function lopThiNhanDien($id)
    {
        $query = DiemNhanDienLopThi::where("lop_thi_id", $id);
        return $this->responseSuccess($query->get());
    }
    public function getLopThiSV(Request $request)
    {
        $ki_hoc = $request->get("ki_hoc");
        $lop = $request->get("lop");
        $ki_thi = $request->get("ki_thi");
        $query = LopThi::join("ph_lops", "ph_lops.id", "=", "ph_lop_this.lop_id");
        $query->whereHas("sinhViens", function ($q) use ($request) {
            $user = $request->user();
            $q->where("id", $user->info_id);
        });
        if (!empty($ki_hoc)) {
            $query->where("ph_lops.ki_hoc", $ki_hoc);
        }
        if (!empty($lop)) {
            $query->where("ph_lops.id", $lop);
        }
        if (!empty($ki_thi)) {
            $query->where("ph_lop_this.loai", $ki_thi);
        }
        $query->select([
            "ph_lop_this.id",
            "ph_lops.id as lop_id",
            "ph_lops.ki_hoc",
            "ph_lops.ten_hp",
            DB::raw("ph_lops.ma as ma_lop_hoc"),
            DB::raw("ph_lop_this.ma as ma_lop_thi"),
            "ph_lops.ma_hp",
        ]);
        return $this->responseSuccess($query->get());
    }
    public function sendEmail($id, Request $request)
    {
        $query = LopThi::query();
        $query = QueryBuilder::for($query, $request)->allowedIncludes($this->includes);
        $lop_thi = $query->findOrFail($id);
        $sinh_viens = $lop_thi->sinhViens;
        $count = $sinh_viens->count();
        if (config("app.debug")) {
            $sinh_viens = [$sinh_viens[0]];
        }
        foreach ($sinh_viens as $sinh_vien) {
            $info_email =
                "SEND MAIL NOTIFY - LOP THI - MSSV: " .
                $sinh_vien->mssv .
                " - EMAIL: " .
                $sinh_vien->email .
                " - LOP_ID: " .
                $lop_thi->getKey() .
                " - DATE: " .
                Carbon::now()->format("Y-m-d-hh-mm-ss");
            Log::channel("email")->debug($info_email);
            if ($sinh_vien->email) {
                $email = $sinh_vien->email;
                if (config("app.debug")) {
                    $email = "hphamviet83@gmail.com";
                }
                Mail::to($email)->queue(
                    new MailNotify([
                        "title" => "Lịch thi ngày " . $lop_thi->ngay_thi->format("d/m/Y") . " lúc " . $lop_thi->kip_thi,
                        "content" =>
                            "Bạn có lịch thi tại phòng: <br />" .
                            $lop_thi->phong_thi .
                            " vào ngày " .
                            $lop_thi->ngay_thi->format("d/m/Y") .
                            " lúc " .
                            $lop_thi->kip_thi .
                            ".",
                        "subtitle" => "Vui lòng có mặt trước 15p để làm thủ tục thi",
                    ])
                );
            }
        }
        return $this->responseSuccess("Gửi email thành công cho $count sinh viên");
    }
}
