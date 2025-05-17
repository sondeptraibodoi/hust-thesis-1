import { Space, Table } from "antd";

import Column from "antd/es/table/Column";
import { FC } from "react";
import { formatDate } from "@/utils/formatDate";
import { BaoCaoSinhVien } from ".";

const TableBaoCao: FC<any> = ({ baoCao }) => {
  return (
    <Table rowKey="id" dataSource={baoCao} pagination={false}>
      <Column
        title="Ngày đánh giá"
        dataIndex="ngay_bao_cao"
        key="ngay_bao_cao"
        render={(_: any, record: BaoCaoSinhVien) => {
          return <Space size="middle">{formatDate(record.ngay_bao_cao)}</Space>;
        }}
      />
      <Column title="Lần" dataIndex="lan" key="lan" />
      <Column
        title="Nội dung kế hoạch"
        dataIndex="noi_dung_thuc_hien"
        key="noi_dung_thuc_hien"
        render={(_: any, record: BaoCaoSinhVien) => {
          return <div className="whitespace-pre-wrap">{record.noi_dung_thuc_hien}</div>;
        }}
      />
      <Column
        title="Nội dung đã thực hiện"
        dataIndex="noi_dung_da_thuc_hien"
        key="noi_dung_da_thuc_hien"
        render={(_: any, record: BaoCaoSinhVien) => {
          return <div className="whitespace-pre-wrap">{record.noi_dung_da_thuc_hien}</div>;
        }}
      />
      <Column title="Điểm tích cực" dataIndex="diem_y_thuc" key="diem_y_thuc" />
      <Column title="Điểm nội dung" dataIndex="diem_noi_dung" key="diem_noi_dung" />
      <Column
        title="Ghi chú"
        dataIndex="ghi_chu"
        key="ghi_chu"
        render={(_: any, record: BaoCaoSinhVien) => {
          return <div className="whitespace-pre-wrap">{record.ghi_chu}</div>;
        }}
      />
    </Table>
  );
};

export default TableBaoCao;
