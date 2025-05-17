import { Button, Card, Typography } from "antd";
import { FC, useContext } from "react";
import { BaiThiContext } from "./context";

const { Text } = Typography;
export const BaiThiMenu: FC = () => {
  const { currentIndex, setCurrentIndex, answers, items, cauHoiStatus, onNopBai } = useContext(BaiThiContext);
  const currentItem = currentIndex >= 0 ? items[currentIndex] : null;
  const renderButtons = () => {
    return items.map((question, index) => (
      <Button
        key={question.id}
        style={{
          width: "70px",
          height: "35px",
          borderColor: getBorderColor(index, currentIndex, answers[question.id], cauHoiStatus[question.id]),
          color: getColor(index, currentIndex, cauHoiStatus[question.id])
        }}
        onClick={() => setCurrentIndex && setCurrentIndex(index)}
        loading={cauHoiStatus[question.id]?.loading}
      >
        {question.stt}
      </Button>
    ));
  };
  return (
    <Card title={<div className="py-2">Mục lục câu hỏi</div>} style={{ textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        {renderButtons()}
      </div>
      <div>
        {currentItem && cauHoiStatus[currentItem.id] && cauHoiStatus[currentItem.id].error && (
          <Text type="danger">{cauHoiStatus[currentItem.id].error}</Text>
        )}
      </div>
      <Button type="primary" style={{ marginTop: "20px" }} onClick={() => onNopBai()}>
        Kết thúc
      </Button>
    </Card>
  );
};
function getColor(index: number, currentIndex: number, cauHoiStatus: { loading: boolean; error?: string }) {
  if (cauHoiStatus && cauHoiStatus.error) {
    return "#ff4d4f";
  }
  if (currentIndex === index) {
    return "#2462b3";
  }
  return "#000";
}

function getBorderColor(
  index: number,
  currentIndex: number,
  answers: string | string[],
  cauHoiStatus: { loading: boolean; error?: string }
) {
  if (cauHoiStatus && cauHoiStatus.error) {
    return "#ff4d4f";
  }
  if (currentIndex === index) {
    return "#1890ff";
  }
  if (answers) {
    return "#2e7d32";
  }
  return "#d9d9d9";
}
