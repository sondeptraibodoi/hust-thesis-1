import { FC } from "react";

export const GhiChuCellRender: FC<{
  data: any;
  showExtraInfo: boolean;
}> = ({ data, showExtraInfo }) => {
  if (!showExtraInfo) {
    return "";
  }
  if (!data.ghi_chu) {
    return "";
  }
  let ghi_chu = data.ghi_chu;
  if (typeof ghi_chu === "string") {
    ghi_chu = JSON.parse(ghi_chu);
  }
  let content = <p>Điểm gốc: {formatDiem(data.diem)}</p>;
  if (ghi_chu.diem_thi_bu != null) {
    content = ghi_chu.diem_thi_bu >= 0 ? <p>Điểm thi bù</p> : <p></p>;
  }
  if (ghi_chu.diem_phuc_khao != null) {
    content = <p>Điểm gốc: {formatDiem(data.diem)}</p>;
  }
  return <div>{content}</div>;
};
function formatDiem(diem: number) {
  return diem < 0 ? "-" : diem;
}
