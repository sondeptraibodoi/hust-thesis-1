import { LoaiThiCellRender } from "@/components/TrangThaiCellRender";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Card, Divider, Typography } from "antd";
import dayjs from "dayjs";
import { FC, memo, useContext, useState } from "react";
import { BaiThiContext } from "./context";
import { CountdownTimer } from "./countdown";

const { Title } = Typography;
export const BaiThiInfo: FC<{ chuong: HocPhanChuong; loaiThi: string }> = memo(({ chuong, loaiThi }) => {
  const { onShowResult } = useContext(BaiThiContext);
  const [timeLeft] = useState(dayjs().add(chuong.thoi_gian_thi, "minute").toString());

  return (
    <Card
      title={
        <div className="py-2 whitespace-break-spaces">
          {chuong.ma_hoc_phan} - {chuong.ten}
        </div>
      }
    >
      <Title level={4}>Bài thi</Title>
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Chế độ:</p>
        <p className="m-0 font-bold leading-6 text-base">{LoaiThiCellRender({ data: loaiThi })}</p>
      </div>
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Số câu hỏi:</p>
        <p className="m-0 font-bold leading-6 text-base">{chuong.so_cau_hoi}</p>
      </div>
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Điểm tối đa:</p>
        <p className="m-0 font-bold leading-6 text-base">{chuong.diem_toi_da}</p>
      </div>

      <Divider style={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
      <Title level={4}>Thời gian thi</Title>
      {/* {dataThi?.thoi_gian_bat_dau && (
        <div className="d-flex mb-4">
          <p className="m-0 font-normal leading-6 text-base mr-2">Bắt đầu:</p>
          <p className="m-0 font-normal leading-6 text-base mr-2">{formatTimeDate(dataThi.thoi_gian_bat_dau)}</p>
        </div>
      )}
      {dataThi?.thoi_gian_ket_thuc && (
        <div className="d-flex mb-4">
          <p className="m-0 font-normal leading-6 text-base mr-2">Kết thúc nộp bài:</p>
          <p className="m-0 font-normal leading-6 text-base mr-2">{formatTimeDate(dataThi.thoi_gian_ket_thuc)}</p>
        </div>
      )} */}
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Còn lại:</p>
        <p className="m-0 font-bold leading-6 text-xl" style={{ color: "#CF1627" }}>
          <CountdownTimer targetDate={timeLeft} onDone={() => onShowResult()} />
        </p>
      </div>
      <Divider style={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
      <div>
        <Title level={5}>
          Khi bắt đầu làm bài là kết quả được ghi nhận. Nếu giữa chừng bị ngắt kết nối thì bài kiểm tra được tính từ lúc
          bắt đầu đến lúc xảy ra sự cố
        </Title>
      </div>
    </Card>
  );
});

// const formatTimeDate = (time?: string) => {
//   if (!time) {
//     return "";
//   }
//   return dayjs(time).format("HH:mm");
// };
