import monHocApi from "@/api/mon-hoc/monHoc.api";
import PageContainer from "@/Layout/PageContainer";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Row } from "antd";
import { useEffect, useState } from "react";
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
      cancelText: "Quay lại",
      onOk: () => {
        navigate(`/sohoa/danh-gia-nang-luc/${id}`);
      },
      onCancel: () => {
        navigate('/sohoa/sinh-vien/mon-hoc');
      }
    });
  };

  if (data && !data.level) {
    confirm();
  }
  return (
    <PageContainer title="Kiểm tra">
      {contextHolder}
      <Row className="flex justify-center">
        <Button type="primary" className="w-[50%] mt-[10%] text-center  text-5xl font-bold h-[250px] cursor-pointer" onClick={() => navigate(`/sohoa/kiem-tra/${id}`)}>Làm bài kiểm tra</Button>
      </Row>
    </PageContainer>
  );
};

export default KiemTraPage;
