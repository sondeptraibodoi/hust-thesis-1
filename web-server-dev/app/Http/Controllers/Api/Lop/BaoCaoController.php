<?php

namespace App\Http\Controllers\Api\Lop;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use App\Models\DoAnBaoCao\DoAnBaoCao;
use DB;
use Illuminate\Http\Request;

class BaoCaoController extends Controller
{
    public function index(Request $request)
    {
        $query = DoAnBaoCao::query();
        $query = QueryBuilder::for($query, $request)->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->paginate()), 200, []);
    }
    public function show(Request $request, $id)
    {
        $query = DoAnBaoCao::query();
        $query = QueryBuilder::for($query, $request);
        return response()->json(
            [
                "data" => $query->findOrFail($id),
            ],
            200,
            []
        );
    }

    public function indexForLanBaoCao(Request $request, $id)
    {
        $query = DB::table("ph_do_an_bao_caos as do_an_bao_caos")
            ->join("u_sinh_viens as sinh_viens", "do_an_bao_caos.sinh_vien_id", "=", "sinh_viens.id")
            ->join(
                "ph_lop_sinh_vien_do_ans as lop_sinh_vien_do_ans",
                "lop_sinh_vien_do_ans.sinh_vien_id",
                "=",
                "sinh_viens.id"
            )
            ->join("ph_lops as lop", "lop.id", "=", "lop_sinh_vien_do_ans.lop_id")

            ->select([
                "do_an_bao_caos.id as do_an_bao_cao_id",
                "do_an_bao_caos.lan_bao_cao_id",
                "do_an_bao_caos.noi_dung_thuc_hien",
                "do_an_bao_caos.noi_dung_da_thuc_hien",
                "do_an_bao_caos.diem_y_thuc",
                "do_an_bao_caos.diem_noi_dung",
                "sinh_viens.id as sinh_vien_id",
                "sinh_viens.mssv",
                "sinh_viens.name",
                "lop_sinh_vien_do_ans.id as lop_sinh_vien_do_an_id",
                "lop_sinh_vien_do_ans.ten_de_tai",
                "lop_sinh_vien_do_ans.noi_dung",
                "lop_sinh_vien_do_ans.cac_moc_quan_trong",
                "lop.ma_hp",
                "lop.ten_hp",
            ])
            ->where("do_an_bao_caos.lan_bao_cao_id", $id);

        return $query->get();
    }

    public function updateBaoCao(Request $request)
    {
        DB::beginTransaction();

        try {
            $info_bao_caos = $request->all();

            foreach ($info_bao_caos as $info_bao_cao) {
                $do_an_bao_cao_id = $info_bao_cao["do_an_bao_cao_id"];

                $bao_cao = DoAnBaoCao::find($do_an_bao_cao_id);

                if ($bao_cao) {
                    $bao_cao->update([
                        "noi_dung_thuc_hien" => $info_bao_cao["noi_dung_thuc_hien"],
                        "noi_dung_da_thuc_hien" => $info_bao_cao["noi_dung_da_thuc_hien"],
                        "diem_y_thuc" => $info_bao_cao["diem_y_thuc"],
                        "diem_noi_dung" => $info_bao_cao["diem_noi_dung"],
                    ]);
                }
            }

            DB::commit();
            return $this->responseSuccess();
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(["message" => "Có lỗi xảy ra khi cập nhật"], 500);
        }
    }
}
