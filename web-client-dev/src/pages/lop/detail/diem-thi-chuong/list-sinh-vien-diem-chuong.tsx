import { Button, Card, Modal, Space, Table, Tooltip, Typography } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import BaseResponsive from "@/components/base-responsive";
import BieuDoThongKe from "./bieu-do-thong-ke";
import { ChuongCellRender } from "@/components/TrangThaiCellRender";
import Column from "antd/es/table/Column";
import type { ColumnsType } from "antd/es/table";
import { Lop } from "@/interface/lop";
import { SinhVien } from "@/interface/user";
import { UnorderedListOutlined } from "@ant-design/icons";
import diemChuongApi from "@/api/lop/diemChuong.api";

const { Title } = Typography;

const LopHocListSinhVienDiemChuongPage: FC<{
  lop: Lop;
}> = ({ lop }) => {
  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [item, setItem] = useState<any>();

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await diemChuongApi.list(lop.id);
      setDataSource(res.data);
    } finally {
      setLoading(false);
    }
  }, [lop]);

  const columns: ColumnsType<SinhVien> = [
    {
      title: "Mã sinh viên",
      dataIndex: "sinh_vien.mssv",
      key: "sinh_vien.mssv",
      render: (_, record: any) => record.sinh_vien.mssv
    },
    {
      title: "Tên sinh viên",
      dataIndex: "sinh_vien.name",
      key: "sinh_vien.name",
      render: (_, record: any) => record.sinh_vien.name
    },
    {
      title: "Số chương",
      dataIndex: "count_diem",
      key: "count_diem",
      align: "center"
    },
    {
      title: "Điểm",
      dataIndex: "sum_diem",
      key: "sum_diem",
      align: "center",
      width: 80
    },
    {
      title: "Hành động",
      dataIndex: "action",
      align: "center",
      width: 150,
      render: (_, record) => ActionCellRender({ openModal, data: record })
    }
  ];
  useEffect(() => {
    getData();
  }, []);

  const openModal = (record: any) => {
    setItem(record);
    setShow(true);
  };

  const handleCancel = () => {
    setShow(false);
  };

  const contentDesktop = () => (
    <>
      <Table
        loading={loading}
        columns={columns}
        className="danh_sach_sv"
        dataSource={dataSource}
        rowKey="sinh_vien_id"
        pagination={false}
        scroll={{ y: 500 }}
      />
      <BieuDoThongKe dataSource={dataSource} />
      <Modal
        title={`${item?.sinh_vien.mssv} - ${item?.sinh_vien.name}`}
        open={show}
        onCancel={handleCancel}
        footer={<></>}
        width={1000}
        centered
      >
        {item && (
          <Table
            rowKey="id"
            dataSource={item.sinh_vien.diem_hoc_phan_chuong}
            pagination={false}
            loading={loading}
            scroll={{ y: 400 }}
          >
            <Column
              title="Tên chủ đề"
              dataIndex="ten"
              key="ten"
              width={200}
              render={(_: any, record: any) => {
                return (
                  <Space size="middle">
                    <ChuongCellRender ten={record.chuong?.ten} stt={record.chuong?.stt}></ChuongCellRender>
                  </Space>
                );
              }}
            />
            <Column
              title="Thời gian thi (phút)"
              dataIndex="thoi_gian_thi"
              key="thoi_gian_thi"
              align="center"
              render={(_: any, record: any) => {
                return <Space size="middle">{record.chuong.thoi_gian_thi}</Space>;
              }}
            />
            <Column
              title="Số câu hỏi"
              dataIndex="so_cau_hoi"
              key="so_cau_hoi"
              align="center"
              render={(_: any, record: any) => {
                return <Space size="middle">{record.chuong.so_cau_hoi}</Space>;
              }}
            />
            <Column
              title="Điểm tối đa"
              dataIndex="diem_toi_da"
              key="diem_toi_da"
              align="center"
              render={(_: any, record: any) => {
                return <Space size="middle">{record.chuong.diem_toi_da}</Space>;
              }}
            />
            <Column title="Điểm" dataIndex="diem" key="diem" align="center" />
          </Table>
        )}
      </Modal>
    </>
  );
  const contentMobile = () => (
    <div className="card-container card-diem-danh">
      {dataSource.length > 0 ? (
        dataSource.map((record: any) => (
          <Card
            key={record.id}
            title={
              <>
                <strong className="card-diem-danh__title">STT : </strong>
                <span className="card-diem-danh__sub">{record.stt}</span>
              </>
            }
          >
            <p>
              <strong>MSSV: </strong>
              {record.sinh_vien.mssv}
            </p>
            <p>
              <strong>Tên sinh viên: </strong>
              {record.sinh_vien.name}
            </p>
            <p>
              <strong>Mã học phần: </strong>
              {record.ma_hp}
            </p>
            <p>
              <strong>Tên học phần: </strong>
              {record.ten_hp}
            </p>

            <p>
              <strong>Tên chủ đề: </strong>
              {record.ten_chuong}
            </p>
            <p>
              <strong>Điểm: </strong>
              {record.diem}
            </p>
          </Card>
        ))
      ) : (
        <div className="p-2 text-center"> Chưa có sinh viên nào làm bài thi </div>
      )}
    </div>
  );
  return (
    <>
      <div className="d-flex items-center justify-between">
        <Title level={3}>Điểm đánh giá liên tục</Title>
      </div>

      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile}></BaseResponsive>
    </>
  );
};

const ActionCellRender: FC<any> = ({ openModal, data }) => {
  if (!data) {
    return <span></span>;
  }

  return (
    <>
      <Tooltip title="Chi tiết">
        <Button
          shape="circle"
          icon={<UnorderedListOutlined />}
          type="text"
          onClick={() => {
            openModal(data);
          }}
        />
      </Tooltip>
    </>
  );
};

export default LopHocListSinhVienDiemChuongPage;
