import PageContainer from "@/Layout/PageContainer";
import { useEffect, useState } from "react";
import { Question, QuizPage } from "./form";
import { useNavigate, useParams } from "react-router-dom";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { notification } from "antd";

const DanhGiaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigator = useNavigate();
  const [data, setData] = useState<Question[]>([]);
  const [de, setDe] = useState<any>();
  useEffect(() => {
    if (!id) return;
    const getQuiz = async () => {
      const res = await cauHoiApi.listDanhGia({
        lop_hoc_id: id
      });
      if(res.data.data) {
        const questions = res.data.data.de_thi.chi_tiet_de_this.map((item: any) => {
        const cauHoi = item.cau_hoi;
        const options: Record<string, string> = { A: "", B: "", C: "", D: "" };

        cauHoi.dap_ans.forEach((ans: any) => {
          const key = ans.name.toUpperCase(); // "a" → "A"
          if (["A", "B", "C", "D"].includes(key)) {
            options[key] = ans.context;
          }
        });
        return {
          id: item.id, // id của chi_tiet_de_thi
          question: cauHoi.de_bai,
          options
        };
      });
      const de = {
        time: res.data.data.de_thi.thoi_gian_thi,
        mon_hoc_id: res.data.data.de_thi.mon_hoc_id,
        de_thi_id: res.data.data.de_thi_id,
        ten_mon: res.data.data.de_thi.mon_hoc.ten_mon_hoc
      };
      setDe(de);
      setData(questions);
      } else {
        notification.error({
          message: "Không tìm thấy đề thi",
          description: "Không tìm thấy đề thi. Vui lòng liên hệ với giáo viên phụ trách"
        })
        navigator('/sohoa/lop-hoc');
      }

    };
    getQuiz();
  }, [id]);
  if (!de) return;
  return (
    <PageContainer title="Đánh giá năng lực">
      <QuizPage title={de.ten_mon} de_thi_id={de.de_thi_id} questions={data} type="danh-gia" time={de.time} mon_hoc_id={de.mon_hoc_id} />
    </PageContainer>
  );
};

export default DanhGiaPage;
