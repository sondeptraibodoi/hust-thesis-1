import { Lop, LopThi } from "@/interface/lop";
import { useMemo } from "react";
import { useLoaderData } from "react-router-dom";

import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { LopHocBangDiemDaiCuong } from "./dai-cuong";
import { LopHocBangDiemChuyeNganh } from "./chuyen-nganh";
import PageContainer from "@/Layout/PageContainer";
import { Col, Row, Typography } from "antd";
import LopHocDetailInfoPage from "../info";

const { Title } = Typography;
const LopHocBangDiemPage = () => {
  const lop_thi = useLoaderData() as LopThi;
  const lop = lop_thi.lop as Lop;
  const { format: formatDotThi } = useLoaiLopThi();
  const breadcrumbs = useMemo(() => {
    return [
      { router: "../../", text: "Danh sách lớp thi" },
      { text: lop_thi.lop?.ten_hp },
      {
        router: "../",
        text: lop_thi.lop?.ma
      },
      { text: "Bảng điểm" },
      { text: formatDotThi(lop_thi.loai) }
    ];
  }, [lop_thi, formatDotThi]);
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Row className="full-width ">
        <Col span={24}>
          <LopHocDetailInfoPage lop={lop} />
        </Col>
        <Col span={24}>
          <Title level={3} className="text-center">
            Điểm thi sinh viên
          </Title>
          {lop.is_dai_cuong ? (
            <LopHocBangDiemDaiCuong lop_thi={lop_thi} lop={lop} />
          ) : (
            <LopHocBangDiemChuyeNganh lop_thi={lop_thi} lop={lop} />
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};
export default LopHocBangDiemPage;
