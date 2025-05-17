<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Library\FormData\Reader\Reader;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Storage;

class ImportReadController extends Controller
{
    public function readExcel(Request $request)
    {
        $request->validate([
            "file" => ["required", "file"],
        ]);
        $uploadedFile = $request->file("file");
        $folder = time();
        $path = Storage::disk("temp")->putFileAs($folder, $uploadedFile, $uploadedFile->getClientOriginalName());
        if (!$path) {
            abort(400, "Không thế đọc được tập tin");
        }
        $reader = new Reader("excel", [Storage::disk("temp")->path($path)]);
        return $this->responseSuccess([
            "items" => $reader->getRecords(),
            "headers" => $reader->getFields(),
            "total" => $reader->getTotal(),
        ]);
    }
    public function suggest(Request $request)
    {
        $request->validate([
            "type" => [
                "required",
                Rule::in([
                    "giao-vien",
                    "sinh-vien",
                    "lop",
                    "lop-thi",
                    "lop-thi-sv",
                    "nhiem-vu-phuc-khao",
                    "lop-thi-bu",
                    "import-do-an",
                    "import-phan-bien",
                    "import-lop-diem",
                    "import-tin-nhan",
                ]),
            ],
        ]);
        $suggest = [
            "import-tin-nhan" => [
                "tin_nhan" => ["Chi tiết giao dịch"],
                "phi" => ["Số tiền giao dịch"],
            ],
            "giao-vien" => [
                "name" => ["Teacher", "teacher", "Name", "name"],
                "email" => ["Email", "email"],
            ],
            "lop" => [
                "ma" => ["Mã lớp"],
                "ma_kem" => ["Mã lớp kèm"],
                "ma_hp" => ["Mã_HP", "Mã HP"],
                "ten_hp" => ["Tên_HP", "Tên học phần"],
                "loai" => ["Loại lớp"],
                "ghi_chu" => ["Ghi_chú", "Ghi chú"],
                "giao_vien_email" => ["Email"],
                "lop_thu" => ["Thứ"],
                "lop_thoigian" => ["Thời gian"],
                "lop_kip" => ["Kíp"],
                "lop_phong" => ["Phòng"],
                "tuan_hoc" => ["Tuần"],
            ],
            "sinh-vien" => [
                "ma_lop" => ["classid", "Mã lớp"],
                "ma_hp" => ["courseid", "Mã Học phần"],
                "ten_hp" => ["name", "Tên Học phần"],
                "sinh_vien_id" => ["StudentID", "MSSV"],
                "sinh_vien_name" => ["studentname", "Họ và tên SV"],
                "sinh_vien_lop" => ["groupname", "Tên lớp"],
                "sinh_vien_nhom" => ["studygroupname", "Tên lớp"],
                "sinh_vien_birthday" => ["birthdate"],
            ],
            "lop-thi" => [
                "ma_lop" => ["classid"],
                "nhom" => ["studyGroup"],
                "ma_lop_thi" => ["ExamID"],
                "loai" => ["termNote"],
                "ngay_thi" => ["Ngày"],
                "kip_thi" => ["Kíp thi"],
                "phong_thi" => ["Phòng thi"],
            ],

            "lop-thi-sv" => [
                "mssv" => ["StudentID"],
                "ma_lop" => ["classid"],
                "nhom" => ["studygroupname"],
                "ma_lop_thi" => ["ExamID"],
            ],
            "lop-thi-bu" => [
                "ma_lop" => ["classid"],
                "ma_hp" => ["courseid"],
                "mssv" => ["StudentID"],
                "nhom" => ["studygroupname"],
                "ngay_thi" => ["ngayThi"],
                "kip_thi" => ["kipThi"],
                "phong_thi" => ["phongThi"],
            ],
            "nhiem-vu-phuc-khao" => [
                "mssv" => ["mssv", "MSSV"],
                "ma_lop_thi" => ["ma_lop_thi", "Mã lớp thi"],
                "diem_phuc_khao" => ["diem_phuc_khao", "Điểm phúc khảo"],
            ],
            "nhap-diem" => [
                "mssv" => ["mssv", "MSSV"],
                "diem" => ["diem", "Điểm"],
            ],
            "import-do-an" => [
                "ma_lop" => ["classid"],
                "ma_hp" => ["courseid"],
                "ten_hp" => ["name"],
                "sinh_vien_id" => ["StudentID"],
                "sinh_vien_name" => ["studentname"],
                "sinh_vien_lop" => ["groupname"],
                "sinh_vien_nhom" => ["studygroupname", "groupname"],
                "sinh_vien_birthday" => ["birthdate"],
                "giao_vien_huong_dan_email" => ["Giáo viên hướng dẫn", "email-gvhd"],
                "ten_do_an" => ["Tên đồ án", "Tên đề tài"],
                "noi_dung" => ["Nội dung đồ án"],
                "cac_moc_quan_trong" => ["Các mộc quan trọng"],
            ],
            "import-phan-bien" => [
                "ma_hp" => ["courseid", "Mã HP", "Mã học phần"],
                "mssv" => ["MSSV", "Mã sinh viên"],
                "giao_vien_phan_bien_email" => ["Giáo viên phản biện", "email-gvpb"],
            ],
            "import-lop-diem" => [
                "ma" => ["Mã lớp", "MaLopHoc"],
                "mssv" => ["MSSV", "Mã sinh viên"],
                "diem" => ["Điểm", "Diem", "DiemTichCucOnline"],
            ],
        ];
        return $suggest[$request->type];
    }
}
