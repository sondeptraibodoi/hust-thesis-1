import LopSinhVienApi from "@/api/lop/lopCuaSinhVien.api";
import { Loading } from "@/pages/Loading";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Card, Col } from "antd";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { BaoCaoSinhVien, LopDetail } from "..";
import TableBaoCao from "../table-baoCao";

export const LopDoAnBaoCao: FC<{ data: LopDetail }> = ({ data }) => {
  const isMobile = useMediaQuery({ maxWidth: 600 });

  const { isLoading, data: baoCao } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["lop", data.id, "bao-cao"],
    queryFn: ({ queryKey }) => {
      const [, lop_id] = queryKey;
      return LopSinhVienApi.getBaoCao(lop_id).then((res) => res.data as BaoCaoSinhVien[]);
    }
  });
  if (isLoading) {
    return <Loading />;
  }
  return isMobile ? (
    <div className="card-container card-chi-tiet-diem-danh">
      {(baoCao || []).length > 0 ? (
        baoCao?.map((record) => (
          <Col span={24} key={record.id}>
            <Card>
              <p className="my-1">
                <strong>Ngày đánh giá:</strong> {formatDate(record.ngay_bao_cao)}
              </p>
              <p className="my-1">
                <strong>Lần:</strong> {record.lan}
              </p>
              <p className="my-1">
                <strong>Nội dung kế hoạch:</strong> {record.noi_dung_thuc_hien}
              </p>
              <p className="my-1">
                <strong>Nội dung đã thực hiện:</strong> {record.noi_dung_da_thuc_hien}
              </p>
              <p className="my-1">
                <strong>Điểm tích cực:</strong> {record.diem_y_thuc}
              </p>
              <p className="my-1">
                <strong>Điểm nội dung:</strong> {record.diem_noi_dung}
              </p>
              <p className="my-1">
                <strong>Ghi chú:</strong> {record.ghi_chu}
              </p>
            </Card>
          </Col>
        ))
      ) : (
        <div className="p-2 text-center"> Chưa có đánh giá đồ án nào</div>
      )}
    </div>
  ) : (
    <TableBaoCao baoCao={baoCao} />
  );
};
