import MathDisplay from "@/components/MathDisplay";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { Card, Checkbox, Radio, Space } from "antd";
import { FC, useMemo, useState } from "react";

const renderMath = (content: string) => {
  if (!content) return "";
  return <MathDisplay mathString={content} />;
};
export const CauHoiViewComplex: FC<{
  cauHoi: HocPhanCauHoi;
  button?: React.ReactNode;
}> = ({ cauHoi, button }) => {
  const tabList = useMemo(
    () => [
      {
        key: "format",
        tab: "Định dạng"
      },
      {
        key: "raw",
        tab: "Gốc"
      }
    ],
    [cauHoi.id]
  );
  const [activeTabKey, setActiveTabKey] = useState<string>("format");
  return (
    <Card
      tabList={tabList}
      activeTabKey={activeTabKey}
      onTabChange={setActiveTabKey}
      tabBarExtraContent={button && button}
      className="cau-hoi-view"
    >
      {activeTabKey === "format" && (
        <>
          <div className="text-xl font-medium text-primary ">Câu hỏi</div>
          <CauHoiFormat cauHoi={cauHoi} />
          {cauHoi?.loi_giai && (
            <>
              <br />
              <div className="text-xl font-medium text-primary">Lời giải</div>
              {renderMath(cauHoi?.loi_giai)}
            </>
          )}
        </>
      )}
      {activeTabKey === "raw" && (
        <>
          <div className="text-xl font-medium text-primary">Câu hỏi</div>
          <CauHoiRaw cauHoi={cauHoi} />
        </>
      )}
    </Card>
  );
};

export const CauHoiFormat: FC<{ cauHoi: Partial<HocPhanCauHoi> }> = ({ cauHoi }) => {
  const lua_chon = cauHoi?.lua_chon || [];
  const dap_an = cauHoi?.dap_an || [];
  const noi_dung = cauHoi?.noi_dung;
  return (
    <>
      {noi_dung && <div className="text-xl font-medium">{renderMath(noi_dung)}</div>}
      {lua_chon.map((answer: any) => (
        <Space key={answer.id} className="d-flex my-3 text-base">
          {cauHoi?.loai === "multi" ? (
            <Checkbox checked={dap_an.includes(answer.id)}>{renderMath(answer.content)}</Checkbox>
          ) : (
            <Radio checked={dap_an.includes(answer.id)}>{renderMath(answer.content)}</Radio>
          )}
        </Space>
      ))}
    </>
  );
};

export const CauHoiRaw: FC<{ cauHoi: HocPhanCauHoi }> = ({ cauHoi }) => {
  const lua_chon = cauHoi?.lua_chon || [];
  const dap_an = cauHoi?.dap_an || [];
  const noi_dung = cauHoi?.noi_dung;
  const dap_an_show = useMemo(() => {
    return lua_chon.map((x) => {
      return (
        <span key={x.id}>
          \item{dap_an.includes(x.id) ? <span>*</span> : ` `} {x.content}
          <br />
        </span>
      );
    });
  }, [cauHoi.id]);
  let loigiai = null;
  if (cauHoi.loi_giai) {
    loigiai = (
      <>
        <br />
        {"\\begin{solution}"}
        <br></br>
        <span>{cauHoi.loi_giai}</span>
        <br />
        {"\\end{solution}"}
      </>
    );
  }
  return (
    <code className="d-block">
      {"\\begin{multi}"}
      <br></br>
      <span>{noi_dung}</span>
      <br />
      <div className="pl-4">{dap_an_show}</div>
      {"\\end{multi}"}
      {loigiai}
    </code>
  );
};
