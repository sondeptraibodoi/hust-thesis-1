import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Card, Typography, Tag, Spin, message, Button } from "antd";
import { sdk } from "@/api/axios";

const { Title } = Typography;

const DetailBaiLamPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await sdk.get(`/bai-lam/${id}`);
      setData(res.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu bài làm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "cau_hoi",
      key: "cau_hoi"
    },
    {
      title: "Đáp án đã chọn",
      key: "dap_an_sinh_vien_chon",
      render: (_: any, record: any) => (
        <Tag color={record.dung_hay_sai === "Đúng" ? "green" : "red"}>
          {record.dap_an_sinh_vien_chon}. {record.noi_dung_sv_chon}
        </Tag>
      )
    },
    {
      title: "Đáp án đúng",
      key: "dap_an_dung",
      render: (_: any, record: any) => (
        <Tag color="green">
          {record.dap_an_dung}. {record.noi_dung_dung}
        </Tag>
      )
    },
    {
      title: "Kết quả",
      dataIndex: "dung_hay_sai",
      key: "dung_hay_sai",
      render: (text: any) => <Tag color={text === "Đúng" ? "green" : "red"}>{text}</Tag>
    }
  ];

  if (loading) return <Spin style={{ marginTop: 100 }} size="large" />;

  if (!data) return;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Chi tiết bài làm</Title>
      <Card style={{ marginBottom: 24 }}>
        <p>
          <b>Sinh viên:</b> {data.sinh_vien}
        </p>
        <p>
          <b>Mã đề thi:</b> {data.de_thi}
        </p>
        <p>
          <b>Điểm:</b> {data.diem}
        </p>
      </Card>

      <Table columns={columns} dataSource={data.chi_tiet_cau_hoi} rowKey={(idx) => idx} pagination={false} />
      <Button
        type="primary"
        onClick={() => {
          navigate("/sohoa/diem-sinh-vien");
        }}
        className="float-right mt-4"
      >
        Quay lại
      </Button>
    </div>
  );
};

export default DetailBaiLamPage;
