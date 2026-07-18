<?php

use App\Http\Controllers\Api\Academic\BangDiemController;
use App\Http\Controllers\Api\Academic\CauHinhHeThongController;
use App\Http\Controllers\Api\Academic\DangKyMonHocController;
use App\Http\Controllers\Api\Academic\GiaoVienChuNhiemController;
use App\Http\Controllers\Api\Academic\HocKyController;
use App\Http\Controllers\Api\Academic\LopHanhChinhController;
use App\Http\Controllers\Api\Academic\LopHocPhanController;
use App\Http\Controllers\Api\Academic\PhucKhaoController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:sanctum', 'prefix' => 'academic'], function () {
    Route::get('hoc-ky', [HocKyController::class, 'index']);
    Route::post('hoc-ky', [HocKyController::class, 'store']);
    Route::put('hoc-ky/{id}', [HocKyController::class, 'update']);
    Route::delete('hoc-ky/{id}', [HocKyController::class, 'destroy']);

    Route::get('cau-hinh', [CauHinhHeThongController::class, 'index']);
    Route::post('cau-hinh', [CauHinhHeThongController::class, 'upsert']);

    Route::get('lop-hoc-phan', [LopHocPhanController::class, 'index']);
    Route::post('lop-hoc-phan', [LopHocPhanController::class, 'store']);
    Route::get('lop-hoc-phan/{id}', [LopHocPhanController::class, 'show']);
    Route::put('lop-hoc-phan/{id}', [LopHocPhanController::class, 'update']);
    Route::delete('lop-hoc-phan/{id}', [LopHocPhanController::class, 'destroy']);

    Route::get('lop-hanh-chinh', [LopHanhChinhController::class, 'index']);
    Route::post('lop-hanh-chinh', [LopHanhChinhController::class, 'store']);
    Route::put('lop-hanh-chinh/{id}', [LopHanhChinhController::class, 'update']);
    Route::delete('lop-hanh-chinh/{id}', [LopHanhChinhController::class, 'destroy']);

    Route::get('dang-ky-mon-hoc/mon-mo', [DangKyMonHocController::class, 'monMoDangKy']);
    Route::get('dang-ky-mon-hoc', [DangKyMonHocController::class, 'index']);
    Route::post('dang-ky-mon-hoc', [DangKyMonHocController::class, 'store']);
    Route::put('dang-ky-mon-hoc/{id}/xep-lop', [DangKyMonHocController::class, 'xepLop']);
    Route::put('dang-ky-mon-hoc/{id}/huy', [DangKyMonHocController::class, 'cancel']);

    Route::get('bang-diem', [BangDiemController::class, 'index']);
    Route::put('bang-diem/{id}', [BangDiemController::class, 'update']);
    Route::put('bang-diem/{id}/chot', [BangDiemController::class, 'chotDiem']);

    Route::get('phuc-khao', [PhucKhaoController::class, 'index']);
    Route::post('phuc-khao', [PhucKhaoController::class, 'store']);
    Route::put('phuc-khao/{id}/xu-ly', [PhucKhaoController::class, 'resolve']);

    Route::get('chu-nhiem/sinh-vien', [GiaoVienChuNhiemController::class, 'sinhViens']);
    Route::post('chu-nhiem/lop/{lopId}/sinh-vien', [GiaoVienChuNhiemController::class, 'assignSinhViens']);
    Route::post('chu-nhiem/lop/{lopId}/sinh-vien/create', [GiaoVienChuNhiemController::class, 'createSinhVien']);
    Route::delete('chu-nhiem/lop/{lopId}/sinh-vien/{sinhVienId}', [GiaoVienChuNhiemController::class, 'removeSinhVien']);
    Route::get('chu-nhiem/sinh-vien/{id}', [GiaoVienChuNhiemController::class, 'tongQuanSinhVien']);
});
