<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ThongKeDiemExport implements WithEvents, WithStyles
{
    use Exportable;
    private $file = "danh_sach_lop.xlsx";
    private $data;
    private $sub_data;
    private $headers;
    public function __construct($data, $sub_data)
    {
        $this->file = "danh_sach_lop.xlsx";
        $this->data = $data;
        $this->sub_data = $sub_data;
        $this->headers = [
            "Học kì",
            "Đợt thi",
            "Mã học phần",
            "Mã lớp học",
            "Mã lớp thi",
            "MSSV",
            "Tên sinh viên",
            "Điểm",
        ];
    }
    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle("A:J")->getFont()->setSize(14);
        $sheet->getStyle("A:J")->getFont()->setName("Times New Roman");
        $sheet
            ->getStyle("A:J")
            ->getFont()
            ->getColor()
            ->setARGB(Color::COLOR_BLACK);
    }
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $title_style = [
                    "font" => [
                        "size" => 22,
                        "name" => "Times New Roman",
                    ],
                    "alignment" => [
                        "vertical" => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                        "horizontal" => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    ],
                ];
                $sub_title_style = [
                    "font" => [
                        "size" => 16,
                        "name" => "Times New Roman",
                    ],
                    "alignment" => [
                        "vertical" => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                        "horizontal" => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
                    ],
                ];

                // set cao rộng cột,hàng
                $event->sheet->getColumnDimension("A")->setWidth(15);
                $event->sheet->getRowDimension("1")->setRowHeight(60);
                $event->sheet->getColumnDimension("B")->setWidth(25);
                $event->sheet->getColumnDimension("C")->setWidth(30);
                $event->sheet->getColumnDimension("D")->setWidth(20);
                $event->sheet->getColumnDimension("E")->setWidth(25);
                $event->sheet->getColumnDimension("F")->setWidth(20);
                $event->sheet->getColumnDimension("G")->setWidth(35);
                $event->sheet->getColumnDimension("H")->setWidth(15);
                // $event->sheet->getColumnDimension("I")->setWidth(15);
                // $event->sheet->getColumnDimension("J")->setWidth(15);

                $event->sheet->mergeCells("A1:J1");
                $event->sheet->getDelegate()->getStyle("A1:J1")->applyFromArray($title_style);
                $event->sheet
                    ->getDelegate()
                    ->getStyle("A2:J2")
                    ->applyFromArray(["font" => ["bold" => true]]);

                // set style sub_title
                $ma_hp = $this->sub_data["ma_hp"];
                $dot_thi =
                    $this->sub_data["dot_thi"] === "GK"
                        ? "Giữa kỳ"
                        : ($this->sub_data["dot_thi"] === "GK2"
                            ? "Giữa kỳ lần 2"
                            : ($this->sub_data["dot_thi"] === "CK"
                                ? "Cuối kỳ"
                                : ($this->sub_data["dot_thi"] === "TB-GK"
                                    ? "Thi bù - Giữa kỳ"
                                    : ($this->sub_data["dot_thi"] === "TB-GK2"
                                        ? "Thi bù - Giữa kỳ lần 2"
                                        : $this->sub_data["dot_thi"]))));
                $ki_hoc = $this->sub_data["ki_hoc"];
                $loai = $this->sub_data["loai"] === true ? "Đại cương" : "Chuyên ngành";

                $event->sheet->setCellValue("A1", "Thống kê điểm kỳ $ki_hoc lớp $loai đợt thi $dot_thi");

                for ($i = 1; $i <= 8; $i++) {
                    $col = Coordinate::stringFromColumnIndex($i);
                    $event->sheet->setCellValue("{$col}2", $this->headers[$i - 1]);
                }
                foreach ($this->data as $key => $item) {
                    $idx = $key + 3;
                    $event->sheet->setCellValue("A{$idx}", $item["lop_thi"]["lop"]["ki_hoc"]);
                    // $event->sheet->setCellValue("B{$idx}", $item['lop_thi']['loai']);
                    $event->sheet->setCellValue(
                        "B{$idx}",
                        $item["lop_thi"]["loai"] === "GK"
                            ? "Giữa kỳ"
                            : ($item["lop_thi"]["loai"] === "GK2"
                                ? "Giữa kỳ lần 2"
                                : ($item["lop_thi"]["loai"] === "CK"
                                    ? "Cuối kỳ"
                                    : ($item["lop_thi"]["loai"] === "TB-GK"
                                        ? "Thi bù - Giữa kỳ"
                                        : ($item["lop_thi"]["loai"] === "TB-GK2"
                                            ? "Thi bù - Giữa kỳ lần 2"
                                            : $item["lop_thi"]["loai"]))))
                    );
                    $event->sheet->setCellValue("C{$idx}", $item["lop_thi"]["lop"]["ma_hp"]);
                    $event->sheet->setCellValue("D{$idx}", $item["lop_thi"]["lop"]["ma"]);
                    $event->sheet->setCellValue("E{$idx}", $item["lop_thi"]["ma"]);
                    $event->sheet->setCellValue("F{$idx}", $item["sinh_vien"]["mssv"]);
                    $event->sheet->setCellValue("G{$idx}", $item["sinh_vien"]["name"]);
                    // $event->sheet->setCellValue("H{$idx}", $item['diem']);
                    $diem = $item["diem"] < 0 ? "-" : $item["diem"];
                    if (isset($item["ghi_chu"]) && isset($item["ghi_chu"]["diem_phuc_khao"])) {
                        $diem = $item["ghi_chu"]["diem_phuc_khao"];
                    } elseif (
                        isset($item["ghi_chu"]) &&
                        isset($item["ghi_chu"]["diem_thi_bu"]) &&
                        $item["ghi_chu"]["diem_thi_bu"] >= 0
                    ) {
                        $diem = $item["ghi_chu"]["diem_thi_bu"];
                    }
                    $event->sheet->setCellValue("H{$idx}", $diem);
                    $event->sheet
                        ->getStyle("H{$idx}")
                        ->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);
                }
            },
        ];
    }
}
