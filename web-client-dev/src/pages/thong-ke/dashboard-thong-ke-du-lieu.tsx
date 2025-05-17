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
import { useEffect, useState } from "react";

import CardDuLieu from "./card-du-lieu";
import { Link } from "react-router-dom";
import PageContainer from "@/Layout/PageContainer";
import configApi from "@/api/config.api";
import { getPrefix } from "@/constant";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import userApi from "@/api/admin/user.api";

interface ThongKeData {
  totalBaoLoi: number;
  totalLop: number;
  totalSVThucTap: number;
  totalChuaDangKyThucTap: number;
  totalNhiemVuDaLam: number;
  totalNhiemVuQuaHan: number;
  totalNhiemVu: number;
}
const { Option } = Select;
const { Title } = Typography;
const ThongKeDuLieuPage = () => {
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [kiHienGio, setKiHienGio] = useState<string>("");
  const [kiHocFilter, setKiHocFilter] = useState<string>(kiHienGio);
  const [data, setData] = useState<ThongKeData | null>(null);

  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);

  useEffect(() => {
    const getKyHocHienGio = async () => {
      const res = await configApi.getKiHienGio();
      if (res.data && res.data.length > 0) {
        setKiHienGio(res.data);
        setKiHocFilter(res.data);
      }
    };
    getKyHocHienGio();
  }, []);

  const fetchData = async (kiHocFilter: string) => {
    try {
      const response = await userApi.listThongKeDuLieu(kiHocFilter);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      <></>;
    }
  };

  useEffect(() => {
    if (kiHocFilter) {
      fetchData(kiHocFilter);
    }
  }, [kiHocFilter]);

  const handleChange = (value: string) => {
    setKiHocFilter(value);
  };

  return (
    <>
      <PageContainer title="Thống kê dữ liệu">
        <div className="flex gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p>Kì học: </p>
          <Select allowClear style={{ width: 200 }} placeholder="Kì học" value={kiHocFilter} onChange={handleChange}>
            {renderKiHoc(kiHoc)}
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

const renderKiHoc = (kihoc: string[]) => {
  if (!Array.isArray(kihoc)) return <></>;
  if (!kihoc || !kihoc.length) return <></>;
  return (
    <>
      {kihoc.map((item) => {
        return (
          <Option key={item} value={item} label={item}>
            {item}
          </Option>
        );
      })}
    </>
  );
};
