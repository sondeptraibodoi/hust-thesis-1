import PageContainer from '@/Layout/PageContainer'
import React, { useEffect, useState } from 'react'
import { Question, QuizPage } from './form'
import { useParams } from 'react-router-dom'
import cauHoiApi from '@/api/cauHoi/cauHoi.api'

export type RawData = {
  id: number;
  de_bai: string; // JSON string
};

function convert(rawData: RawData[]): Question[] {
  return rawData.map((item) => {
    const deBai = JSON.parse(item.de_bai);
    return {
      id: item.id,
      question: deBai.de_bai,
      options: {
        A: deBai.a,
        B: deBai.b,
        C: deBai.c,
        D: deBai.d,
      },
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
