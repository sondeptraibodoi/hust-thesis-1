import { LOAI_BAI_THI } from "@/constant";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Button, Result, Typography, Modal } from "antd";
import { FC, memo, useState } from "react";

const { Text } = Typography;
export type HpChuongThi = HocPhanChuong & {
  extra?: { can_exam?: boolean; da_co_diem?: boolean; ngay_dong_thi: string; ngay_mo_thi: string };
};
const ExamSelect: FC<{
  onSelectExam: (thi: string) => void;
  title?: string;
  chuong: HpChuongThi;
  diem?: string;
  canExam?: boolean;
}> = memo(({ chuong, onSelectExam, title, diem, canExam }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const examTime = chuong.thoi_gian_thi;
  const extra = [
    <Button key="thi-thu" style={{ width: "150px" }} onClick={() => onSelectExam(LOAI_BAI_THI.THI_THU)}>
      Thi thử
    </Button>
  ];
  if (chuong.extra?.can_exam && !chuong.extra?.da_co_diem) {
    extra.push(
      <Button key="thi-chinh-thuc" type="primary" style={{ width: "150px" }} onClick={() => setShowConfirm(true)}>
        Thi
      </Button>
    );
  }
  if (!canExam) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Result title="Không hỗ trợ thi"></Result>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Result
        title={title || "Thời gian đọc đã hết. Bạn có thể bắt đầu bài thi!"}
        subTitle={
          <>
            <p>
              Bạn có thể lựa chọn <strong style={{ color: "#CF1627" }}>Thi thử (Không tính điểm)</strong> hoặc{" "}
              <strong style={{ color: "#CF1627" }}>Thi (Có tính điểm)</strong>. Thời gian thi:{" "}
              <strong style={{ color: "#CF1627" }}>{examTime}</strong> phút
            </p>
            <p>
              Bạn có thể thi thử trong từng chủ đề, tại sao không? Việc thi thử theo từng chủ đề giúp bạn kiểm tra và
              củng cố kiến thức từng phần, từ đó chuẩn bị tốt hơn cho kỳ thi chính thức
            </p>
            {!chuong.extra?.can_exam && (
              <p>
                Bạn sẽ được phép <strong style={{ color: "#CF1627" }}>Thi (Có tính điểm)</strong> trong khoảng thời gian
                từ ngày {chuong.extra?.ngay_mo_thi} đến trước ngày {chuong.extra?.ngay_dong_thi}
              </p>
            )}
            {chuong.extra?.da_co_diem && (
              <>
                <h3>
                  {" "}
                  <Text type="secondary"> Bạn đã thi ở chủ đề này. {"Điểm bài thi là: " + (diem || 0)} </Text>
                </h3>
              </>
            )}
          </>
        }
        extra={extra}
      />
      <Modal
        open={showConfirm}
        closable={false}
        maskClosable={false}
        onOk={() => {
          setShowConfirm(false);
          onSelectExam(LOAI_BAI_THI.THI_THAT);
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p className="font-bold">
            Khi bắt đầu làm bài là kết quả được ghi nhận. Nếu giữa chừng bị ngắt kết nối thì bài kiểm tra được tính từ
            lúc bắt đầu đến lúc xảy ra sự cố. Bạn cần kiểm tra lại mọi thứ trước khi bắt đầu làm bài
          </p>
        </div>
      </Modal>
    </div>
  );
});
export default ExamSelect;
