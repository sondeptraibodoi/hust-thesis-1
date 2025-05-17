import { FC } from "react";

export const GhiChuThongKeDiemCellRender: FC<{
  data: any;
}> = ({ data }) => {
  if (!data.ghi_chu) {
    return "";
  }
  let ghi_chu = data.ghi_chu;
  if (typeof ghi_chu === "string") {
    ghi_chu = JSON.stringify(ghi_chu);
  }
  let content = <p>{data.diem}</p>;
  if (ghi_chu != null) {
    if (ghi_chu.diem_phuc_khao) {
      content = <p>{ghi_chu.diem_phuc_khao}</p>;
    } else if (ghi_chu.diem_thi_bu != null && ghi_chu.diem_thi_bu >= 0) {
      content = <p>{ghi_chu.diem_thi_bu}</p>;
    }
  }
  return <div>{content}</div>;
};
