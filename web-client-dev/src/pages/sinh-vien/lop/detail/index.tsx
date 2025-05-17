import lopCuaSinhVienApi from "@/api/lop/lopCuaSinhVien.api";
import BaseHandlerGetDetail from "@/components/base-handler-get-detail";
import { Lop } from "@/interface/lop";
import PageContainer from "@/Layout/PageContainer";
import { setHeightAuto } from "@/stores/features/config";
import { useAppDispatch } from "@/stores/hook";
import { queryOptions } from "@tanstack/react-query";
import {
  // Input,
  // Row,
  // Select,
  Typography
} from "antd";
import React, { FC, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import ListTaiLieuLopSVPage from "./list-tai-lieu-lop";
import { LopDiem } from "./part/diem";
import { LopDiemDanh } from "./part/diem-danh";
import { LopDoAnBaoCao } from "./part/doan-baocao";
import { LopInfo } from "./part/info";
import TableThucTap from "./thuc-tap";
export type LopDetail = Lop & {
  extra: { type: "khong_tinh_chuyen_can" | "truot"; parent_lop: Lop }[];
  lop_sinh_vien_do_an?: any;
  giao_vien_phan_bien?: any;
};

export interface BaoCaoSinhVien {
  id: string;
  lan: string;
  ngay_bao_cao: any;
  noi_dung_thuc_hien: string;
  noi_dung_da_thuc_hien: string;
  diem_y_thuc: any;
  diem_noi_dung: any;
  ghi_chu: any;
}

const LopHocSDetailPage: React.FC<{ lop: LopDetail }> = ({ lop }) => {
  const dispatch = useAppDispatch();
  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách lớp học" }, { text: lop?.ten_hp }, { text: lop?.ma }];
  }, [lop]);

  useEffect(() => {
    dispatch(setHeightAuto(true));
    return () => {
      dispatch(setHeightAuto(false));
    };
  });

  const is_do_an =
    lop.ma_hoc_phan != null && (lop.ma_hoc_phan?.is_do_an === true || lop.ma_hoc_phan?.is_do_an_tot_nghiep === true);

  const is_thuc_tap = lop?.ma_hoc_phan !== null && lop?.ma_hoc_phan?.is_thuc_tap === true;
  const show_diem_danh = !is_do_an && !is_thuc_tap;

  return (
    <PageContainer title="" breadcrumbs={breadcrumbs}>
      <LopInfo data={lop} />
      <LopDiem data={lop} />

      {show_diem_danh && (
        <div style={{ marginTop: "8px" }}>
          <Typography.Title level={3} style={{ textAlign: "center" }}>
            Danh sách điểm danh
          </Typography.Title>
          <LopDiemDanh data={lop} />
        </div>
      )}

      {is_do_an && (
        <div className="mt-10">
          <Typography.Title level={3} style={{ textAlign: "center" }}>
            Danh sách đánh giá đồ án
          </Typography.Title>
          <LopDoAnBaoCao data={lop} />
        </div>
      )}

      {is_thuc_tap && (
        <div style={{ marginTop: "8px" }}>
          <Typography.Title level={3} style={{ textAlign: "center", marginTop: "20px" }}>
            Thông tin thực tập
          </Typography.Title>
          <TableThucTap ma_lop={lop?.ma} lop_id={lop?.id} />
        </div>
      )}

      <div className="mt-10">
        <ListTaiLieuLopSVPage lop={lop} />
      </div>
    </PageContainer>
  );
};

const Page: FC = () => {
  const { id } = useParams();
  const option = queryOptions({
    queryKey: ["lop", id!],
    staleTime: 1 * 60 * 60 * 1000,
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return lopCuaSinhVienApi.getDetail(id).then((res) => res.data);
    }
  });
  return <BaseHandlerGetDetail option={option}>{(data) => <LopHocSDetailPage lop={data} />}</BaseHandlerGetDetail>;
};
export default Page;
