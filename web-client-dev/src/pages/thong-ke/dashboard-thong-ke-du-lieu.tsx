import {
  BugOutlined,
  CalculatorOutlined,
  FileDoneOutlined,
  FileExclamationOutlined,
  HomeOutlined,
  TeamOutlined,
  UsergroupDeleteOutlined
} from "@ant-design/icons";
import { Col, Row, Select, Typography } from "antd";
import { useState } from "react";

import CardDuLieu from "./card-du-lieu";
import { Link } from "react-router-dom";
import PageContainer from "@/Layout/PageContainer";
import { getPrefix } from "@/constant";

interface ThongKeData {
  totalBaoLoi: number;
  totalLop: number;
  totalSVThucTap: number;
  totalChuaDangKyThucTap: number;
  totalNhiemVuDaLam: number;
  totalNhiemVuQuaHan: number;
  totalNhiemVu: number;
}
const { Title } = Typography;
const ThongKeDuLieuPage = () => {
  const [data] = useState<ThongKeData | null>(null);


  return (
    <>
      <PageContainer title="Thống kê dữ liệu">
        <div className="flex gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p>Kì học: </p>
          <Select allowClear style={{ width: 200 }} placeholder="Kì học">
          </Select>
        </div>
        <div className="pt-5">
          <Title level={4}>Tổng quan</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/bao-loi"}>
                <CardDuLieu title="Báo lỗi chưa xử lý" value={data ? data.totalBaoLoi : 0} icon={<BugOutlined />} />
              </Link>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/lop-hoc"}>
                <CardDuLieu title="Số lượng lớp học" value={data ? data.totalLop : 0} icon={<HomeOutlined />} />
              </Link>
            </Col>
          </Row>
        </div>
        <div className="pt-5">
          <Title level={4}>Thực tập</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/tro-ly/danh-sach-thuc-tap"}>
                <CardDuLieu title="Sinh viên thực tập" value={data ? data.totalSVThucTap : 0} icon={<TeamOutlined />} />
              </Link>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/tro-ly/danh-sach-thuc-tap"}>
                <CardDuLieu
                  title="Sinh viên chưa đăng ký"
                  value={data ? data.totalChuaDangKyThucTap : 0}
                  icon={<UsergroupDeleteOutlined />}
                />
              </Link>
            </Col>
          </Row>
        </div>
        <div className="pt-5">
          <Title level={4}>Nhiệm vụ</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/giao-nhiem-vu"}>
                <CardDuLieu title="Tổng số" value={data ? data.totalNhiemVu : 0} icon={<CalculatorOutlined />} />
              </Link>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/giao-nhiem-vu"}>
                <CardDuLieu title="Đã làm" value={data ? data.totalNhiemVuDaLam : 0} icon={<FileDoneOutlined />} />
              </Link>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Link to={getPrefix() + "/giao-nhiem-vu"}>
                <CardDuLieu
                  title="Quá hạn"
                  value={data ? data.totalNhiemVuQuaHan : 0}
                  icon={<FileExclamationOutlined />}
                />
              </Link>
            </Col>
          </Row>
        </div>
      </PageContainer>
    </>
  );
};

export default ThongKeDuLieuPage;
