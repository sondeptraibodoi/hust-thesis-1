import PageContainer from "@/Layout/PageContainer";
import { LanDiemDanh } from "@/interface/lop";
import { useEffect, useMemo } from "react";
import { useLoaderData } from "react-router-dom";
import { Col, Row, Tabs } from "antd";
import { useAppDispatch } from "@/stores/hook";
import { setHeightAuto } from "@/stores/features/config";
import LopHocDetailInfoPage from "../detail/info";
import DiemDanhListSinhVien from "./list-sinh-vien";

const LopHocDetailPage = () => {
  const dispatch = useAppDispatch();
  const lan_diem_danh = useLoaderData() as LanDiemDanh;
  const lop = lan_diem_danh.lop as any;
  lop.ngay_mo_diem_danh = lan_diem_danh.ngay_mo_diem_danh;
  lop.ngay_dong_diem_danh = lan_diem_danh.ngay_dong_diem_danh;
  const isHasChild = !!lan_diem_danh.lop.children && lan_diem_danh.lop.children.length > 0;
  const tabs = useMemo(() => {
    if (!lan_diem_danh.lop || !lan_diem_danh.lop.children) {
      return [];
    }
    return lan_diem_danh.lop.children.map((x) => ({
      key: x.ma,
      label: x.ma,
      children: <DiemDanhListSinhVien lan_diem_danh={lan_diem_danh} lop={x} />
    }));
  }, [isHasChild, lan_diem_danh]);
  const breadcrumbs = useMemo(() => {
    return [
      { router: "../../", text: "Danh sách lớp dạy" },
      { text: lan_diem_danh.lop.ten_hp },
      {
        router: "../",
        text: lan_diem_danh.lop.ma
      },
      { text: "Điểm danh" }
    ];
  }, [lan_diem_danh]);

  useEffect(() => {
    dispatch(setHeightAuto(true));
    return () => {
      dispatch(setHeightAuto(false));
    };
  });
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Row className="full-width">
        <Col span={24}>
          <LopHocDetailInfoPage lop={lop} />
        </Col>
        <Col span={24}>
          {isHasChild ? (
            <Tabs defaultActiveKey="1" items={tabs} />
          ) : (
            <DiemDanhListSinhVien lan_diem_danh={lan_diem_danh} lop={lan_diem_danh.lop} />
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default LopHocDetailPage;
