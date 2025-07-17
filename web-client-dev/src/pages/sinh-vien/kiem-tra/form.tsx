import PageContainer from "@/Layout/PageContainer";
import { useEffect, useState } from "react";
import { Question, QuizPage } from "../danh-gia-nang-luc/form";
import { useParams } from "react-router-dom";
import deThiApi from "@/api/deThi/deThi.api";
import Title from "antd/es/typography/Title";

export type RawData = {
  id: number;
  de_bai: string; // JSON string
};

const BaiThiPage = () => {
  const [time, setTime] = useState(15);
  const [mon, setMon] = useState("");
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Question[]>([]);
  const [de, setDe] = useState<any>(null);
  useEffect(() => {
    if (!id) return;
    const getQuiz = async () => {
      const res = await deThiApi.getDethi(id);
      setTime(res.data.data.thoi_gian_thi);
      setMon(res.data.data.mon_hoc.ten_mon_hoc);
      setDe(res.data.data);
      const questions = res.data.data.chi_tiet_de_this.map((item: any) => {
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
          options,
        };
      });
      setData(questions);
    };
    getQuiz();
  }, [id]);
  return (
    <PageContainer title={"Bài thi " + mon}>
      <Title level={5}>Mã đề thi: {de && de.code}</Title>
      <QuizPage title={mon} questions={data} type="kiem-tra" time={time} mon_hoc_id={id} de_thi_id={de && de.id} />
    </PageContainer>
  );
};

export default BaiThiPage;
