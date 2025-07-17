<?php

namespace App\Http\Controllers\Api\DoAn;

use App\Http\Controllers\Controller;
use App\Library\QueryBuilder\QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CauHoi;
use App\Models\DeThi;
use App\Models\ChiTietDeThi;
use App\Models\LoaiDe;
use App\Models\MonHoc;

class DeThiController extends Controller
{
    public function index(Request $request)
    {
        $query = DeThi::query()->with(['loaiThi'])->where('mon_hoc_id', $request->get('mon_hoc_id'));
        $query = QueryBuilder::for($query, $request)
            ->allowedAgGrid([])
            ->defaultSort("id")
            ->allowedSearch(["code"])
            ->allowedPagination();
        return response()->json(new \App\Http\Resources\Items($query->get()), 200, []);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $cau_hois = $data['cau_hoi'] ?? [];
        $dethi = DeThi::create([
            'loai_thi_id' => $data['loai_thi_id'],
            'mon_hoc_id' => $data['mon_hoc_id'],
            'thoi_gian_thi' => $data['thoi_gian'],
            'ghi_chu' => $data['ghi_chu'] ?? null,
            'nguoi_tao_id' => auth()->user()->id,
            'tong_so_cau_hoi' => count($cau_hois),
            'do_kho' => $data['do_kho'] ?? 0,
            'diem_dat' => $data['diem_dat'] ?? 0,
            'code' => now()->format('Ymd') . str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT),
        ]);
        foreach ($cau_hois as $cau_hoi) {
            $cauhoi = ChiTietDeThi::create([
                'de_thi_id' => $dethi->id,
                'cau_hoi_id' => $cau_hoi['id'],
                'diem' => round(10 / count($cau_hois), 2) ?? 0,
                'ghi_chu' => $cau_hoi['ghi_chu'] ?? null,
            ]);
        }

        return $this->responseSuccess([
            'message' => 'Đề thi đã được tạo thành công',
            'data' => $dethi
        ]);
    }

    public function show($id)
    {
        $dethi = DeThi::with(['chiTietDeThis.cauHoi.dapAns', 'monHoc'])->find($id);
        if (!$dethi) {
            return response()->json(['message' => 'Đề thi không tồn tại'], 404);
        }
        return $this->responseSuccess($dethi);
    }

    public function update(Request $request, $id)
    {
        $dethi = DeThi::find($id);
        if (!$dethi) {
            return response()->json(['message' => 'Đề thi không tồn tại'], 404);
        }

        $data = $request->all();
        $cau_hois = $data['cau_hoi'] ?? [];
        $dethi->update([
            'mon_hoc_id' => $data['mon_hoc_id'],
            'thoi_gian_thi' => $data['thoi_gian'],
            'ghi_chu' => $data['ghi_chu'] ?? null,
            'tong_so_cau_hoi' => count($cau_hois),
            'do_kho' => $data['do_kho'] ?? 0,
            'diem_dat' => $data['diem_dat'] ?? 0,
        ]);

        ChiTietDeThi::where('de_thi_id', $dethi->id)->delete();
        foreach ($cau_hois as $cau_hoi) {
            ChiTietDeThi::create([
                'de_thi_id' => $dethi->id,
                'cau_hoi_id' => $cau_hoi['id'],
                'diem' => round(10 / count($cau_hois), 2) ?? 0,
                'ghi_chu' => $cau_hoi['ghi_chu'] ?? null,
            ]);
        }

        return $this->responseSuccess([
            'message' => 'Đề thi đã được cập nhật thành công',
            'data' => $dethi
        ]);
    }

    public function destroy($id)
    {
        $dethi = DeThi::find($id);
        if (!$dethi) {
            return response()->json(['message' => 'Đề thi không tồn tại'], 404);
        }

        ChiTietDeThi::where('de_thi_id', $dethi->id)->delete();
        $dethi->delete();

        return $this->responseSuccess(['message' => 'Đề thi đã được xóa thành công']);
    }

    public function getDeThiRandom(Request $request, $id)
    {
        $mon = MonHoc::find($id);
        $level = $mon->level();
        $deThi = DeThi::where('do_kho', $level)
            ->with([
                'monHoc',
                'nguoiTao',
                'chiTietDeThis.cauHoi.dapAns',
                'chiTietDeThis.cauHoi' => function ($query) {
                    $query->select('id', 'de_bai');
                }
            ])
            ->inRandomOrder()
            ->first();
        return $this->responseSuccess($deThi);
    }

    public function taoDeThiRandom(Request $request)
    {
        $request->validate([
            'mon_hoc_id' => 'required|integer|exists:mon_hocs,id',
            'so_cau' => 'required|integer|min:1',
            'do_kho_min' => 'required|integer|min:1',
            'do_kho_max' => 'required|integer|min:1|max:10|gte:do_kho_min',
            'loai_thi_id' => 'required|integer|exists:loai_this,id',

        ], [
            'do_kho_max.gte' =>  'Độ khó cao nhất phải lớn hơn giá trị độ khó thấp nhất'
        ]);

        $monHocId = $request->input('mon_hoc_id');
        $soCau = $request->input('so_cau');
        $loai_thi_id = $request->input('loai_thi_id');
        $nguoiTaoId = auth()->id();
        $loaiThi = LoaiDe::find($loai_thi_id);
        $min = $request->do_kho_min;
        $max = $request->do_kho_max;
        $range = $max - $min + 1;
        $chunk = (int) floor($range / 3);
        $deMax = $min + $chunk - 1;
        $tbMin = $deMax + 1;
        $tbMax = $tbMin + $chunk - 1;
        $khoMin = $tbMax + 1;
        $khoMax = $max;
        $tbMax = min($tbMax, $max);
        $khoMin = min($khoMin, $max);
        $soCauDe = floor($soCau * 0.3);
        $soCauTB = floor($soCau * 0.5);
        $soCauKho = $soCau - $soCauDe - $soCauTB;

        $dsDe  = $this->getCauHoiChiaDeuVaFallback($monHocId, $soCauDe, ['Dễ', 'Trung bình', 'Khó'], [$min, $deMax]);
        $dsTB  = $this->getCauHoiChiaDeuVaFallback($monHocId, $soCauTB, ['Trung bình', 'Dễ', 'Khó'], [$tbMin, $tbMax]);
        $dsKho = $this->getCauHoiChiaDeuVaFallback($monHocId, $soCauKho, ['Khó', 'Trung bình', 'Dễ'], [$khoMin, $khoMax]);

        $cauHoiList = $dsDe->concat($dsTB)->concat($dsKho)->shuffle();
        if ($cauHoiList->count() < $soCau) {
            return response()->json([
                'message' => "Không đủ câu hỏi cho môn, không thể tạo đề."
            ], 400);
        }
        do {
            $code = now()->format('Ymd') . str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        } while (DeThi::where('code', $code)->exists());

        DB::beginTransaction();
        try {
            $deThi = DeThi::create([
                'loai_thi_id' => $loai_thi_id,
                'mon_hoc_id' => $monHocId,
                'tong_so_cau_hoi' => $soCau,
                'thoi_gian_thi' => $loaiThi->thoi_gian_thi,
                'nguoi_tao_id' => $nguoiTaoId,
                'do_kho' => $request->do_kho,
                'diem_dat' => $loaiThi->diem_dat,
                'ghi_chu' => null,
                'code' => $code,
            ]);

            $diemMoiCau = 10 / $soCau;

            foreach ($cauHoiList as $cauHoi) {
                ChiTietDeThi::create([
                    'de_thi_id' => $deThi->id,
                    'cau_hoi_id' => $cauHoi->id,
                    'diem' => $diemMoiCau,
                ]);
            }

            DB::commit();
            return $this->responseSuccess();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi tạo đề thi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    function getCauHoiChiaDeuVaFallback($monHocId, $soLuong, array $loaiUuTien, array $doKhoRange)
    {
        $ketQua = collect();
        $tongLoai = count($loaiUuTien);
        $moiLoaiSoLuong = intdiv($soLuong, $tongLoai);
        $du = $soLuong % $tongLoai;
        $soLuongTheoLoai = [];
        foreach ($loaiUuTien as $i => $loai) {
            $soLuongTheoLoai[$loai] = $moiLoaiSoLuong + ($i < $du ? 1 : 0);
        }
        $loaiDaLay = [];

        foreach ($loaiUuTien as $loai) {
            $canLay = $soLuongTheoLoai[$loai] ?? 0;
            if ($canLay <= 0) continue;

            $cauHoi = CauHoi::where('mon_hoc_id', $monHocId)
                ->whereBetween('do_kho', $doKhoRange)
                ->where('loai', $loai)
                ->inRandomOrder()
                ->limit($canLay)
                ->get();

            $daLay = $cauHoi->count();
            $ketQua = $ketQua->concat($cauHoi);
            $loaiDaLay[$loai] = $daLay;
            if ($daLay < $canLay) {
                $conThieu = $canLay - $daLay;
                foreach ($loaiUuTien as $fallbackLoai) {
                    if ($fallbackLoai === $loai) continue;
                    $daLayTruoc = $loaiDaLay[$fallbackLoai] ?? 0;

                    $fallbackCauHoi = CauHoi::where('mon_hoc_id', $monHocId)
                        ->whereBetween('do_kho', $doKhoRange)
                        ->where('loai', $fallbackLoai)
                        ->inRandomOrder()
                        ->limit($conThieu)
                        ->get();

                    $soLay = $fallbackCauHoi->count();
                    $ketQua = $ketQua->concat($fallbackCauHoi);
                    $loaiDaLay[$fallbackLoai] = $daLayTruoc + $soLay;
                    $conThieu -= $soLay;

                    if ($conThieu <= 0) break;
                }
            }
        }

        return $ketQua;
    }
}
