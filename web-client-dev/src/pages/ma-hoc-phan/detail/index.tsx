import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import { HocPhanUser } from "@/interface/hoc-phan";
import PageContainer from "@/Layout/PageContainer";
import HocPhanChuongDetailPage from "@/pages/tro-ly-hoc-phan/hoc-phan-chuong/detail";
import { Checkbox, Descriptions, DescriptionsProps, Row } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";

const DetailMaHocPhanPage = () => {
  const maHocPhan = useLoaderData() as any;
  const [dataInfo, setDataInfo] = useState<HocPhanUser>();
  const [keyRenderInfo, setKeyRenderInfo] = useState(1);

  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Quản lý học phần" }, { text: maHocPhan.ten_hp }, { text: maHocPhan.ma }];
  }, [maHocPhan]);
  const itemsInfor: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Mã học phần",
      children: maHocPhan?.ma
    },
    {
      key: "2",
      label: "Tên học phần",
      children: maHocPhan?.ten_hp
    },
    {
      key: "3",
      label: "Tổng số chủ đề",
      children: dataInfo?.count_chuong
    },
    {
      key: "4",
      label: "Đồ án",
      children: <Checkbox checked={maHocPhan?.is_do_an} />
    },
    {
      key: "5",
      label: "Đồ án tôt nghiệp",
      children: <Checkbox checked={maHocPhan?.is_do_an_tot_nghiep} />
    },
    {
      key: "6",
      label: "Thực tập",
      children: <Checkbox checked={maHocPhan?.is_thuc_tap} />
    }
  ];
  useEffect(() => {
    const getInfo = async () => {
      const res: any = await hocPhanChuongApi.info(maHocPhan.id);
      setDataInfo(res.data);
    };
    getInfo();
  }, [keyRenderInfo]);
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Row className="full-width">
        <Descriptions
          title={<span style={{ fontSize: "22px" }}>Thông tin học phần mã {maHocPhan?.ma}</span>}
          items={itemsInfor}
          className="custom_descriptions mt-4"
        />
      </Row>
      <HocPhanChuongDetailPage setKeyRenderInfo={setKeyRenderInfo} disableShowInfo />
    </PageContainer>
  );
};

export default DetailMaHocPhanPage;
