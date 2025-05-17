import MathDisplay from "@/components/MathDisplay";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { Card, Checkbox, Radio, Space } from "antd";
import { FC } from "react";

const renderMath = (content: string) => {
  if (!content) return "";
  return <MathDisplay mathString={content} />;
};
export const CauHoiView: FC<{
  cauHoi?: Partial<HocPhanCauHoi | undefined>;
  readonly?: boolean;
  button?: React.ReactNode;
}> = ({ cauHoi, readonly, button }) => {
  const lua_chon = cauHoi?.lua_chon || [];
  const dap_an = cauHoi?.dap_an || [];
  const noi_dung = cauHoi?.noi_dung;

  return (
    <Card>
      {noi_dung && <div className="text-xl font-medium">{renderMath(noi_dung)}</div>}
      {lua_chon.map((answer: any) => (
        <Space key={answer.id} className="d-flex my-3 text-base">
          {cauHoi?.loai === "multi" ? (
            <Checkbox checked={readonly && dap_an.includes(answer.id)}>{renderMath(answer.content)}</Checkbox>
          ) : (
            <Radio checked={readonly && dap_an.includes(answer.id)}>{renderMath(answer.content)}</Radio>
          )}
        </Space>
      ))}
      {button && button}
    </Card>
  );
};
