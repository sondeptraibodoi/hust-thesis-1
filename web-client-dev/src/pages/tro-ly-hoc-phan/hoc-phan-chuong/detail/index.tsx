import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import { HocPhanUser } from "@/interface/hoc-phan";
import { ROLE } from "@/interface/user";
import PageContainer from "@/Layout/PageContainer";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { Descriptions, DescriptionsProps, Row } from "antd";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TroLyHocPhanListTaiLieuPage from "./list-tai-lieu";
import HocPhanCauHoiChuong from "./quan-ly-chu-de";
const HocPhanChuongDetailPage: FC<any> = ({ setKeyRenderInfo, disableShowInfo }) => {
  const [dataInfo, setDataInfo] = useState<HocPhanUser>();
  const [keyRender, setKeyRender] = useState(1);
  const authUser = useAppSelector(getAuthUser);
  const { id }: any = useParams();

  const breadcrumbs = useMemo(() => {
    return [
      { router: "../", text: "Danh sách học phần chủ đề" },
      { text: "Học phần" },
      {
        text: dataInfo?.ma_hoc_phan
      }
    ];
  }, [dataInfo]);

  useEffect(() => {
    const getInfo = async () => {
      const res: any = await hocPhanChuongApi.info(id);
      setDataInfo(res.data);
    };
    getInfo();
    setKeyRenderInfo && setKeyRenderInfo(Math.random());
  }, [id, keyRender]);
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Mã học phần",
      children: dataInfo?.ma_hoc_phan
    },
    {
      key: "2",
      label: "Tên học phần",
      children: dataInfo?.ten_hp
    },
    {
      key: "3",
      label: "Tổng số chủ đề",
      children: dataInfo?.count_chuong
    }
  ];
  const reload = useCallback(() => {
    setKeyRender(Math.random());
  }, []);
  return (
    <>
      <PageContainer breadcrumbs={!disableShowInfo && authUser?.roles.includes(ROLE.hp_assistant) ? breadcrumbs : []}>
        {!disableShowInfo && authUser?.roles.includes(ROLE.hp_assistant) && (
          <Descriptions className="mt-3" title="Thông tin mã học phần chủ đề" items={items} />
        )}
        <Row className="full-width block">
          {dataInfo && <HocPhanCauHoiChuong id={id} maHocPhan={dataInfo?.ma_hoc_phan} reload={reload} />}
        </Row>
        <div className="mt-10">{dataInfo && <TroLyHocPhanListTaiLieuPage info={dataInfo} />}</div>
      </PageContainer>
    </>
  );
};
export default HocPhanChuongDetailPage;
