import { FC } from "react";

export const DiemCellRender: FC<{
  data: any;
  showExtraInfo: boolean;
}> = ({ data, showExtraInfo }) => {
  let ghi_chu = data.ghi_chu;
  if (!ghi_chu) {
    return data.diem < 0 ? "-" : data.diem;
  }
  if (typeof ghi_chu === "string") {
    ghi_chu = JSON.parse(ghi_chu);
  }
  if (!showExtraInfo) {
    return data.diem < 0 ? "-" : data.diem;
  }
  if (ghi_chu && ghi_chu.diem_phuc_khao) {
    return ghi_chu.diem_phuc_khao;
  }
  return data.diem < 0 ? "-" : data.diem;
};
