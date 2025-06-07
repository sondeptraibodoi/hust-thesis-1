

<?php
use App\Constants\RoleCode;
use App\Http\Controllers\Api\HocPhanChuong\CauHoiChuongController;
use App\Http\Controllers\Api\HocPhanChuong\CauHoiController;
use App\Http\Controllers\Api\HocPhanChuong\CauHoiPhanBienController;
use App\Http\Controllers\Api\HocPhanChuong\TroLyCauHoiDetailController;
use App\Http\Controllers\Api\HocPhanChuong\TroLyHocPhanCauHoiController;
use Illuminate\Support\Facades\Route;

// Route::group(
//     ["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::HP_ASSISTANT]],
//     function () {
//         Route::post("list-cau-hoi", [TroLyHocPhanCauHoiController::class, "index"]);
//         Route::put("cau-hoi/{id}/sua-do-kho", [TroLyHocPhanCauHoiController::class, "suaDoKhoCauHoi"]);
//     }
// );

// Route::group(["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::ASSISTANT]], function () {
//     Route::post("list-cau-hoi-tro-ly", [TroLyHocPhanCauHoiController::class, "indexAll"]);
//     Route::put("cau-hoi-tro-ly/{id}", [TroLyHocPhanCauHoiController::class, "changeStatusTroLy"]);
// });

// Route::group(
//     ["middleware" => ["auth:sanctum", "api.access.routeNeedsPermission:" . RoleCode::HP_ASSISTANT]],
//     function () {
//         Route::post("cau-hoi", [TroLyHocPhanCauHoiController::class, "store"]);
//         Route::put("cau-hoi/{id}", [TroLyHocPhanCauHoiController::class, "update"]);
//         Route::get("cau-hoi", [TroLyHocPhanCauHoiController::class, "optionCauHoi"]);
//         Route::put("cau-hoi/{id}/huy-bo", [TroLyHocPhanCauHoiController::class, "huyCauHoi"]);
//         Route::put("cau-hoi/{id}/sua-do-kho", [TroLyHocPhanCauHoiController::class, "suaDoKhoCauHoi"]);
//         Route::put("cau-hoi/{id}/phe-duyet-do-kho", [TroLyHocPhanCauHoiController::class, "pheDuyetDoKhoCauHoi"]);
//         Route::post("cau-hoi-tro-ly/loai-thi", [TroLyHocPhanCauHoiController::class, "ganLoaiThiCauHoi"]);
//     }
// );

// Route::group(
//     [
//         "middleware" => [
//             "auth:sanctum",
//             "api.access.routeNeedsPermission:" . RoleCode::ASSISTANT . ";" . RoleCode::HP_ASSISTANT,
//         ],
//     ],
//     function () {
//         Route::post("cau-hoi/{id}/chuongs", [CauHoiChuongController::class, "store"]);
//         Route::delete("cau-hoi/{id}/chuongs/{chuong_id}", [CauHoiChuongController::class, "destroy"]);
//         Route::put("cau-hoi/{id}/chuongs/{chuong_id}/chinh", [CauHoiChuongController::class, "makePrimary"]);
//         Route::post("cau-hoi/{id}/phan-bien", [CauHoiPhanBienController::class, "updateOrCreate"]);
//         Route::put("cau-hoi-tro-ly/{id}/copy", [TroLyHocPhanCauHoiController::class, "copy"]);
//     }
// );

Route::group(
    [
        "middleware" => [
            "auth:sanctum",
            "api.access.routeNeedsPermission:" .
            RoleCode::TEACHER,
        ],
    ],
    function () {
        Route::get("cau-hoi/{id}", [CauHoiController::class, "show"]);
        Route::put("cau-hoi/{id}", [CauHoiController::class, "update"]);
        Route::get("cau-hoi/{id}/chuongs", [CauHoiChuongController::class, "index"]);
        Route::get("cau-hoi/{id}/phan-bien", [TroLyCauHoiDetailController::class, "listPhanBien"]);
    }
);

