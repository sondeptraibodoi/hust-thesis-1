import { Space, Table } from "antd";

import Column from "antd/es/table/Column";
import { DiemDanhSinhVien } from "@/interface/lop";
import { FC } from "react";
import { formatDate } from "@/utils/formatDate";

const TableDiemDanh: FC<any> = ({ diemDanh }) => {
  return (
    <Table rowKey="id" dataSource={diemDanh} pagination={false}>
      <Column title="Lớp" dataIndex="ma_lop" key="ma_lop" />
      <Column title="Loại" dataIndex="loai" key="loai" />
      <Column title="Lần" dataIndex="lan" key="lan" />
      <Column
        title="Ngày điểm danh"
        dataIndex="ngay_diem_danh"
        key="ngay_diem_danh"
        render={(_: any, record: DiemDanhSinhVien) => {
          return <Space size="middle">{formatDate(record.ngay_diem_danh)}</Space>;
        }}
      />
      <Column
        title="Điểm danh"
        dataIndex="diem_danhs"
        key="diem_danhs"
        render={(_: any, record: DiemDanhSinhVien) => {
          return <Space size="middle">{record.co_mat ? "Đi học" : "Vắng"}</Space>;
        }}
      />
    </Table>
  );
};

export default TableDiemDanh;
