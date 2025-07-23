import { FC, useEffect, useState } from "react";
import { Button, Card, Divider, Radio, Space, Typography, message } from "antd";
import type { RadioChangeEvent } from "antd";
import baiThiApi from "@/api/baiThi/baiThi.api";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

export type Question = {
  id: number;
  question: string;
  options: Record<string, string>;
};

interface Props {
  questions: Question[];
  type?: "danh-gia" | "kiem-tra";
  title?: string;
  time?: number;
  mon_hoc_id?: string | number,
  de_thi_id?: string | number
}

export const QuizPage: FC<Props> = (props) => {
  const navigator = useNavigate();
  const { questions, type, title, mon_hoc_id,time = 15, de_thi_id } = props;
  const [current, setCurrent] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(time * 60);
  const [startTime] = useState<Date>(new Date());
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const {id} = useParams();
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  const handleSelect = (e: RadioChangeEvent) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [q.id]: e.target.value });
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handleJump = (index: number) => {
    setCurrent(index);
  };

  const handleSubmit = async (auto = false) => {
    if (isSubmitted) return;
    try {
        const res = await baiThiApi.nopBai({
        type: type,
        answers: answers,
        mon_hoc_id: mon_hoc_id,
        de_thi_id: de_thi_id,
        lop_id: id
      })
        console.log("🚀 ~ handleSubmit ~ res:", res)
      const endTime = new Date();
      const elapsedSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const numAnswered = Object.keys(answers).length;
      message.success(
        `${auto ? "⏰ Hết thời gian! " : ""}Đã nộp bài. Bạn đã làm ${
          numAnswered
        }/${questions.length} câu. Thời gian làm bài: ${formatDuration(elapsedSeconds)}.`
      );
      navigator && navigator(`/sohoa/diem-sinh-vien/${res.data.data.id}`)
    } catch (error) {
      message.error("Nộp bài thất bại");
    } finally {
      setIsSubmitted(true);
    }
  };

  const q = questions[current];
  if (!q || !mon_hoc_id) return;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16
        }}
      >
        <Title level={3}>Bài Kiểm Tra Môn {title}</Title>
        <Text strong type={timeLeft <= 60 ? "danger" : "secondary"}>
          ⏰ Thời gian còn lại: {formatTime(timeLeft)}
        </Text>
      </div>
      <Card title={`Câu ${current + 1} / ${questions.length}`} bordered style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {q.question}
        </Title>

        <Radio.Group
          onChange={handleSelect}
          value={answers[q.id]}
          disabled={isSubmitted}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {Object.entries(q.options).map(([key, value]) => (
            <Radio key={key} value={key}>
              {key}. {value}
            </Radio>
          ))}
        </Radio.Group>

        <Divider />

        <Space>
          <Button onClick={handlePrev} disabled={current === 0}>
            ← Câu trước
          </Button>
          <Button onClick={handleNext} disabled={current === questions.length - 1} type="primary">
            Câu tiếp theo →
          </Button>
        </Space>
      </Card>

      <Divider />
      <div className="flex justify-between">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Space wrap>
            {questions.map((item, index) => {
              const isAnswered = answers[item.id] !== undefined;
              return (
                <Button
                  key={item.id}
                  shape="circle"
                  type={isAnswered ? "primary" : "default"}
                  onClick={() => handleJump(index)}
                >
                  {index + 1}
                </Button>
              );
            })}
          </Space>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button type="primary" danger size="large" onClick={() => handleSubmit()} disabled={isSubmitted}>
            Nộp bài
          </Button>
        </div>
      </div>
    </div>
  );
};
