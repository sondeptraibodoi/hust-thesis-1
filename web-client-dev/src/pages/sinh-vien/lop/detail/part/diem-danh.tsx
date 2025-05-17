import LopSinhVienApi from "@/api/lop/lopCuaSinhVien.api";
import { DiemDanhSinhVien } from "@/interface/lop";
import { Loading } from "@/pages/Loading";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Card, Col } from "antd";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { LopDetail } from "..";
import TableDiemDanh from "../info";

export const LopDiemDanh: FC<{ data: LopDetail }> = ({ data }) => {
  const { isLoading, data: dataSource } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["lop", data.id, "diem-danh"],
    queryFn: ({ queryKey }) => {
      const [, lop_id] = queryKey;
      return LopSinhVienApi.getDiemDanh(lop_id).then((res) => res.data as DiemDanhSinhVien[]);
    }
  });
  const isMobile = useMediaQuery({ maxWidth: 600 });

  if (isLoading) {
    return <Loading />;
  }
  return isMobile ? (
    <div className="card-container card-chi-tiet-diem-danh">
      {(dataSource || []).map((record, key) => (
        <Col span={24} key={record.id}>
          <Card>
            <p className="my-1">
              <strong>STT:</strong> {key + 1}
            </p>
            <p className="my-1">
              <strong>Lớp:</strong> {record.ma_lop}
            </p>
            <p className="my-1">
              <strong>Loại:</strong> {record.loai}
            </p>
            <p className="my-1">
              <strong>Lần:</strong> {record.lan}
            </p>
            <p className="my-1">
              <strong>Ngày điểm danh:</strong> {formatDate(record.ngay_diem_danh)}
            </p>
            <p className="my-1">
              <strong>Điểm danh:</strong> {record.co_mat ? "Đi học" : "Vắng"}
            </p>
          </Card>
        </Col>
      ))}
    </div>
  ) : (
    <TableDiemDanh diemDanh={dataSource} />
  );
};
