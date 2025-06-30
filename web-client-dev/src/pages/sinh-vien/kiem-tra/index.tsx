import monHocApi from "@/api/mon-hoc/monHoc.api";
import PageContainer from "@/Layout/PageContainer";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Card, Col, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Mon {
  ten_mon_hoc: string;
  id: number;
  level?: number;
}

const KiemTraPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Mon>();
  const [modal, contextHolder] = Modal.useModal();
  useEffect(() => {
    const getMon = async () => {
      const res = await monHocApi.getDetail(Number(id));
      setData(res.data.data);
    };
    getMon();
  }, []);

  const confirm = () => {
    modal.confirm({
      centered: true,
      title: "Thông báo",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Bạn chưa làm bài kiểm tra đánh giá năng lực môn này. Hãy ấn nút{" "}
          <span className="text-red-800 font-bold">Xác nhận</span> để bắt đầu kiểm tra
        </span>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        navigate(`/sohoa/danh-gia-nang-luc/${id}`);
      },
    });
  };

  if (data && !data.level) {
    confirm();
  }
  return (
    <PageContainer title="Kiểm tra">
      {contextHolder}
      <Row>
        <Col className="p-6" span={12}>
          <Card
            // onClick={() => navigate(currentUser?.vai_tro === "sinh_vien" ? `kiem-tra/${x.id}` : `/so-hoa/de-thi/${x.id}`)}
            className="w-full text-center flex items-center justify-center text-5xl font-bold h-[750px] cursor-pointer"
          >
            Làm bài kiểm tra
          </Card>
        </Col>
        <Col className="p-6" span={12}>
          <Card
            onClick={() => navigate(`/sohoa/diem-sinh-vien`)}
            className="w-full text-center flex items-center justify-center text-5xl font-bold h-[750px] cursor-pointer"
          >
            Danh sách bài đã làm
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default KiemTraPage;
