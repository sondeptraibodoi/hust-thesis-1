<?php

namespace Database\Seeders;

use App\Library\Log\LogTypeCode;
use App\Models\Log\LogMessage;
use App\Models\Log\LogType;
use Illuminate\Database\Seeder;

class LogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $logs = [
            [
                "code" => LogTypeCode::CAUHOI_CREATE,
                "message" => "{created_by} tạo mới câu hỏi",
            ],
            [
                "code" => LogTypeCode::CAUHOI_UPDATE,
                "message" => "{created_by} cập nhật câu hỏi",
            ],
            [
                "code" => LogTypeCode::CAUHOI_YEUCAUPHEDUYET,
                "message" => "{created_by} yêu cầu phê duyệt",
            ],
            [
                "code" => LogTypeCode::CAUHOI_GIAOGIAOVIEN,
                "message" => "Câu hỏi được giao cho {giao_vien_phe_duyet} bởi {nguoi_giao}",
            ],
            [
                "code" => LogTypeCode::CAUHOI_HUY,
                "message" => "Câu hỏi bị hủy bởi {nguoi_huy}",
            ],
            [
                "code" => LogTypeCode::CAUHOI_PHANBIEN_TUCHOI,
                "message" => "Câu hỏi bị {giao_vien_phan_bien} từ chối",
            ],
            [
                "code" => LogTypeCode::CAUHOI_PHANBIEN_PHEDUYET,
                "message" => "Câu hỏi được {giao_vien_phan_bien} chấp thuận",
            ],
            [
                "code" => LogTypeCode::CAUHOI_YEUCAUSUADOKHO,
                "message" => "{truong_bo_mon} yêu cầu sửa độ khó",
            ],
            [
                "code" => LogTypeCode::CAUHOI_PHEDUYET_SUADOKHO,
                "message" => "{created_by} yêu cầu phê duyệt độ khó",
            ],
            [
                "code" => LogTypeCode::CAUHOI_CHAPTHUAN_SUADOKHO,
                "message" => "Yêu cầu sửa độ khó được {truong_bo_mon} chấp thuận",
            ],
            [
                "code" => LogTypeCode::CAUHOI_TUCHOI_SUADOKHO,
                "message" => "Yêu cầu sửa độ khó bị {truong_bo_mon} từ chối",
            ],
            [
                "code" => LogTypeCode::CAUHOI_DOITRANGTHAI,
                "message" => "{created_by} đã đổi trạng thái câu hỏi",
            ],
            [
                "code" => LogTypeCode::CAUHOI_COPY,
                "message" => "{created_by} sao chép câu hỏi",
            ],
        ];
        foreach ($logs as $log) {
            $type = LogType::updateOrCreate(["code" => $log["code"]]);
            LogMessage::updateOrCreate(["log_type_id" => $type["id"]], ["message" => $log["message"]]);
        }
    }
}
