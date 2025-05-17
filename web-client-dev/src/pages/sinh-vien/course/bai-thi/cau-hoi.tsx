import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Radio } from "antd";
import { FC, useCallback, useContext } from "react";

import { BaiThiContext } from "./context";
import { FieldId } from "@/interface/common";
import { renderMath } from "@/components/TrangThaiCellRender/utils";

export const BaiThiQuestion: FC = () => {
  const { currentIndex, setCurrentIndex, answers, items: questions, handleAnswer } = useContext(BaiThiContext);
  const currentItem = currentIndex >= 0 ? questions[currentIndex] : null;
  const handlePrevQuestion = useCallback(() => {
    setCurrentIndex &&
      setCurrentIndex((currentQuestionIndex) => {
        if (currentQuestionIndex > 0) {
          return currentQuestionIndex - 1;
        }
        return currentQuestionIndex;
      });
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentIndex &&
      setCurrentIndex((currentQuestionIndex) => {
        if (currentQuestionIndex < questions.length - 1) {
          return currentQuestionIndex + 1;
        }
        return currentQuestionIndex;
      });
  }, []);
  const handleAnswerChange = useCallback((questionId: FieldId, answerId: string | string[]) => {
    handleAnswer && handleAnswer(questionId, answerId);
  }, []);
  if (!currentItem) {
    return;
  }
  return (
    <Card
      title={
        <div className="mb-0 py-5">
          <div className="font-medium text-sm">{`Câu ${currentItem.stt}`}</div>
          <p className="font-medium text-base">{renderMath(currentItem.content)}</p>
        </div>
      }
      style={{ marginBottom: "16px", minHeight: "500px" }}
    >
      {currentItem.loai === "multi" ? (
        <Checkbox.Group
          options={currentItem.answers.map((answer: any) => ({
            label: renderMath(answer.content),
            value: answer.id
          }))}
          value={answers[currentItem.id]}
          onChange={(value: any) => handleAnswerChange(currentItem.id, value)}
          className="box-test-questions"
          style={{ minHeight: "340px" }}
        />
      ) : (
        <Radio.Group
          className="box-test-questions"
          options={currentItem.answers.map((answer: any) => ({
            label: renderMath(answer.content),
            value: answer.id
          }))}
          value={answers[currentItem.id]}
          onChange={(e) => handleAnswerChange(currentItem.id, e.target.value)}
          style={{ minHeight: "340px" }}
        ></Radio.Group>
      )}
      {setCurrentIndex && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "10px"
          }}
        >
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
          >
            Trước
          </Button>
          <Button
            type="primary"
            icon={<ArrowRightOutlined className="ml-2 mr-0" />}
            className="d-flex flex-row-reverse items-center"
            onClick={handleNextQuestion}
            disabled={currentIndex === questions.length - 1}
          >
            Sau
          </Button>
        </div>
      )}
    </Card>
  );
};
