<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Color;

class ThucTapExport implements WithEvents, WithStyles
{
    use Exportable;
    private $file = "danh_sach_thuc_tap.xlsx";
    private $data;
    private $sub_data;
    private $sheet_name;
    private $headers;
    public function __construct($data, $sub_data, $sheet_name)
    {
        $this->file = "danh_sach_thuc_tap.xlsx";
        $this->data = $data;
        $this->sub_data = $sub_data;
        $this->sheet_name = $sheet_name;
        $this->headers = [
            "Kỳ học",
            "Mã lớp học",
            "Mã học phần",
            "Tên học phần",
            "Mã sinh viên",
            "Tên sinh viên",
            "Tên công ty",
            "Địa chỉ",
            "Ghi chú",
            "Giáo viên hướng dẫn",
            "Trạng thái",
        ];
    }
    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle("A:K")->getFont()->setSize(14);
        $sheet->getStyle("A:K")->getFont()->setName("Times New Roman");
        $sheet
            ->getStyle("A:K")
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
                        "bold" => true,
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
                        "bold" => true,
                    ],
                    "alignment" => [
                        "vertical" => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                        "horizontal" => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    ],
                ];

                // set cao rộng cột,hàng
                $event->sheet->getColumnDimension("A")->setWidth(25);
                $event->sheet->getRowDimension("1")->setRowHeight(60);
                $event->sheet->getColumnDimension("B")->setWidth(25);
                $event->sheet->getColumnDimension("C")->setWidth(25);
                $event->sheet->getColumnDimension("D")->setWidth(25);
                $event->sheet->getColumnDimension("E")->setWidth(25);
                $event->sheet->getColumnDimension("F")->setWidth(25);
                $event->sheet->getColumnDimension("G")->setWidth(25);
                $event->sheet->getColumnDimension("H")->setWidth(25);
                $event->sheet->getColumnDimension("I")->setWidth(25);
                $event->sheet->getColumnDimension("J")->setWidth(25);
                $event->sheet->getColumnDimension("K")->setWidth(25);

                $event->sheet->mergeCells("A1:K1");
                $event->sheet->getDelegate()->getStyle("A1:K1")->applyFromArray($title_style);
                // set style sub_title

                $event->sheet->setTitle($this->sheet_name);
                $event->sheet->setCellValue("A1", "Danh sách thực tập");
                // $event->sheet->mergeCells("B5:F5");
                // $event->sheet->setCellValue("A5", 'Ngày:');
                for ($i = 1; $i <= 11; $i++) {
                    $col = Coordinate::stringFromColumnIndex($i);
                    $event->sheet->setCellValue("{$col}2", $this->headers[$i - 1]);
                }
                $event->sheet->getDelegate()->getStyle("A2:K2")->applyFromArray($sub_title_style);

                foreach ($this->data as $key => $item) {
                    $idx = $key + 3;
                    $event->sheet->setCellValue("A{$idx}", $item->ki_hoc);
                    $event->sheet->setCellValue("B{$idx}", $item->ma);
                    $event->sheet->setCellValue("C{$idx}", $item->ma_hp);
                    $event->sheet->setCellValue("D{$idx}", $item->ten_hp);
                    $event->sheet->setCellValue("E{$idx}", $item->mssv);
                    $event->sheet->setCellValue("F{$idx}", $item->sinh_vien);
                    $event->sheet->setCellValue("G{$idx}", $item->ten_cong_ty);
                    $event->sheet->setCellValue("H{$idx}", $item->dia_chi);
                    $event->sheet->setCellValue("I{$idx}", $item->ghi_chu);
                    $event->sheet->setCellValue("J{$idx}", $item->giao_vien_hd);
                    $event->sheet->setCellValue("K{$idx}", $item->trang_thai);
                }
            },
        ];
    }
}
