import thiApi, { ThiApiReturn } from "@/api/sinhVien/thi.api";
import imgLogoHoanThanhThi from "@/assets/static/hoan-thanh-thi.png";
import { CauHoiBaiThiConvert } from "@/interface/cauHoi";
import { FieldId } from "@/interface/common";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Lop } from "@/interface/lop";
import { Button, Modal, Typography } from "antd";
import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useCallback, useState } from "react";
import NopBaiDialog from "../dialog-nop-bai";

const { Text } = Typography;

export const BaiThiContext = createContext<{
  baiThiId?: string | number;
  items: CauHoiBaiThiConvert[];
  currentIndex: number;
  setCurrentIndex?: Dispatch<SetStateAction<number>>;
  answers: Record<FieldId, any>;
  loaiThi: string;
  chuong?: HocPhanChuong;
  handleAnswer?: (questionId: FieldId, answerId: string | string[]) => void;
  cauHoiStatus: Record<FieldId, { loading: boolean; error?: string }>;
  onNopBai: () => void;
  onShowResult: () => void;
  dataThi?: ThiApiReturn;
  lop?: Lop;
}>({
  items: [],
  currentIndex: 0,
  answers: {},
  loaiThi: "thi_thu",
  cauHoiStatus: {},
  onNopBai: () => {},
  onShowResult: () => {}
});
interface ExamResult {
  score: number;
  correctAnswersCount: number;
  needReload?: boolean;
  message?: string;
}

export const BaiThiContainer: FC<
  PropsWithChildren & {
    baiThiId?: string | number;
    items: CauHoiBaiThiConvert[];
    loaiThi: string;
    chuong: HocPhanChuong;
    dataThi: ThiApiReturn;
    onDone: () => void;
    lop?: Lop;
  }
> = ({ children, items, loaiThi, baiThiId, chuong, onDone, dataThi, lop }) => {
  const [isModalNopBai, setIsModalNopBai] = useState(false);
  const [showTestScore, setShowTestScore] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cauHoiStatus, setCauHoiStatus] = useState<Record<FieldId, { loading: boolean; error?: string }>>({});
  const [answers, setAnswers] = useState<Record<FieldId, any>>({});
  const handleAnswer = useCallback((questionId: FieldId, answerId: string | string[]) => {
    setAnswers((state) => {
      const res = { ...state };
      res[questionId] = answerId;
      return res;
    });
    sendAnswer(questionId, ensureArray(answerId));
  }, []);
  const sendAnswer = useCallback(async (cau_hoi_id: FieldId, dap_an: string[]) => {
    if (!baiThiId) {
      return;
    }
    setCauHoiStatus((state) => {
      const res = { ...state };
      res[cau_hoi_id] = { loading: true };
      return res;
    });
    try {
      await thiApi.submitQuestion({ bai_thi_id: baiThiId, cau_hoi_id, dap_an });
      setCauHoiStatus((state) => {
        const res = { ...state };
        res[cau_hoi_id] = { ...res[cau_hoi_id], loading: false };
        return res;
      });
    } catch (error: any) {
      if (error.response && error.response.status == 400) {
        setCauHoiStatus((state) => {
          const res = { ...state };
          res[cau_hoi_id] = { ...res[cau_hoi_id], loading: false, error: error.response.data.message };
          return res;
        });
      } else {
        setCauHoiStatus((state) => {
          const res = { ...state };
          res[cau_hoi_id] = {
            ...res[cau_hoi_id],
            loading: false,
            error:
              "Hệ thống đang gặp sự cố khi lưu thông tin trả lời. Vui lòng chọn lại đáp án để lưu lại" +
                error.response && error.response.status
                ? `ERROR: ${error.response.status}`
                : ""
          };
          return res;
        });
      }
    }
  }, []);
  const onShowResult = useCallback(async () => {
    const dap_ans = answers;
    for (const key in dap_ans) {
      if (Object.prototype.hasOwnProperty.call(dap_ans, key)) {
        const element = dap_ans[key];
        dap_ans[key] = ensureArray(element);
      }
    }
    const response = await thiApi.submitAnswers({
      bai_thi_id: baiThiId,
      dap_ans,
      chuong_id: chuong.id
    });
    setExamResult(response.data);
    setShowTestScore(true);
  }, [answers]);
  const onNopBai = useCallback(() => {
    setIsModalNopBai(true);
  }, []);
  return (
    <BaiThiContext.Provider
      value={{
        currentIndex,
        setCurrentIndex,
        items,
        answers,
        loaiThi,
        baiThiId,
        chuong,
        handleAnswer,
        cauHoiStatus,
        onNopBai,
        onShowResult,
        dataThi,
        lop
      }}
    >
      {children}
      <NopBaiDialog isModalVisible={isModalNopBai} onClose={() => setIsModalNopBai(false)} onNopBai={onShowResult} />
      <Modal
        open={showTestScore}
        closable={false}
        maskClosable={false}
        footer={[
          <Button
            type="primary"
            danger
            onClick={() => {
              setShowTestScore(false);
              onDone();
            }}
          >
            Trở về
          </Button>
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <img src={imgLogoHoanThanhThi} alt="Chúc mừng" width={300} height={200} />
          <p>Bạn đã hoàn thành phần thi</p>
          {examResult?.message && (
            <h1>
              <Text type="danger">{examResult?.message}</Text>{" "}
            </h1>
          )}
          <h1>{examResult?.score} điểm</h1>
          <p>
            Số câu đúng: {examResult?.correctAnswersCount} / {chuong.so_cau_hoi}
          </p>
        </div>
      </Modal>
    </BaiThiContext.Provider>
  );
};
function ensureArray(val: string | string[]): string[] {
  if (!Array.isArray(val)) {
    return [val]; // Convert to array
  }
  return val; // Already an array, return as is
}
