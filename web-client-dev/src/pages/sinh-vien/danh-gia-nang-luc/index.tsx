import PageContainer from '@/Layout/PageContainer'
import { useEffect, useState } from 'react'
import { Question, QuizPage } from './form'
import { useParams } from 'react-router-dom'
import cauHoiApi from '@/api/cauHoi/cauHoi.api'

interface RawData {
  id: number;
  de_bai: string;
  dap_an: string; // ví dụ: "A"
  dap_ans: {
    id: number;
    cau_hoi_id: number;
    name: string;     // ví dụ: "a"
    context: string;  // nội dung đáp án
  }[];
}

function convert(rawData: RawData[]): Question[] {
  return rawData.map((item) => {
    const options: Record<string, string> = { A: '', B: '', C: '', D: '' };

    // Map đáp án theo thứ tự A, B, C, D dựa trên name: "a", "b", "c", "d"
    item.dap_ans.forEach((ans) => {
      const key = ans.name.toUpperCase(); // "a" => "A"
      if (['A', 'B', 'C', 'D'].includes(key)) {
        options[key] = ans.context;
      }
    });

    return {
      id: item.id,
      question: item.de_bai,
      options,
      correctAnswer: item.dap_an.toUpperCase(), // để chắc chắn khớp A/B/C/D
    };
  });
}

const DanhGiaPage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Question[]>([]);
  useEffect(() => {
    if(!id) return;
    const getQuiz = async () => {
      const res = await cauHoiApi.listDanhGia({
        mon_hoc_id: id
      })

      setData(convert(res.data.data));
    }
    getQuiz();
  }, [id])
  return (
    <PageContainer title="Đánh giá năng lực">
      <QuizPage questions={data} type='danh-gia' time={15} mon_hoc_id={id}/>
    </PageContainer>
  )
}

export default DanhGiaPage
