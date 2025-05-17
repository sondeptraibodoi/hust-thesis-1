<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;

class SimpleTableExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithEvents
{
    protected $sheet;
    protected $data;
    protected $headings;
    protected $cb_mapping_data;
    protected $length;
    use Exportable;
    public function title(): string
    {
        return $this->sheet;
    }
    public function __construct($sheet, $data, $headings, $cb_mapping_data)
    {
        $this->sheet = $sheet;
        $this->data = $data;
        $this->headings = $headings;
        $this->cb_mapping_data = $cb_mapping_data;
    }
    public function collection()
    {
        $this->length = count($this->data);
        ++$this->length;
        return collect($this->data);
    }
    public function headings(): array
    {
        return array_map(function ($header) {
            return $header["text"] ?? $header;
        }, $this->headings);
    }
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $cellRange = "A1:" . getexcelcolumnname(count($this->headings) - 1) . "1"; // All headers
                $cellRest = "A2:" . getexcelcolumnname(count($this->headings) - 1) . $this->length;
                // Style header
                $styleArray = [
                    "borders" => [
                        "allBorders" => [
                            "borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            "color" => ["argb" => "000"],
                        ],
                    ],
                    "font" => [
                        "name" => "Times New Roman",
                        "size" => 12,
                        "bold" => true,
                        "color" => ["argb" => "000"],
                    ],
                    "alignment" => [
                        "vertical" => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                    ],
                ];
                $event->sheet->getRowDimension(1)->setRowHeight(25);
                $event->sheet->getDelegate()->getStyle($cellRange)->applyFromArray($styleArray);
                //style rest
                $styleArrayRest = [
                    "font" => [
                        "name" => "Times New Roman",
                    ],
                    "borders" => [
                        "allBorders" => [
                            "borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            "color" => ["argb" => "000"],
                        ],
                    ],
                ];
                $event->sheet->getDelegate()->getStyle($cellRest)->applyFromArray($styleArrayRest);
            },
        ];
    }
    public function map($data): array
    {
        $cb = $this->cb_mapping_data;
        return $cb($data);
    }
}
