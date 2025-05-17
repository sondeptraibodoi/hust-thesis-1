import { ChuongCellRender } from "@/components/TrangThaiCellRender";
import { getAuthUser } from "@/stores/features/auth";
import { Card } from "antd";
import { FC, useContext } from "react";
import { useSelector } from "react-redux";
import { BaiThiContext } from "./context";

export const BaiThiInfoUser: FC = () => {
  const { lop, chuong } = useContext(BaiThiContext);
  const authUser = useSelector(getAuthUser);
  if (!lop || !authUser) {
    return;
  }
  return (
    <Card title={<div className="py-2 text-center">Thông tin</div>} className="text-start">
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Mã lớp học:</p>
        <p className="m-0 font-medium leading-6 text-base">{lop?.ma}</p>
      </div>
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Mã học phần:</p>
        <p className="m-0 font-medium leading-6 text-base">{lop?.ma_hp}</p>
      </div>
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Tên học phần:</p>
        <p className="m-0 font-medium leading-6 text-base">{lop?.ten_hp}</p>
      </div>{" "}
      <div className="d-flex mb-4">
        <p className="m-0 font-normal leading-6 text-base mr-2">Chủ đề:</p>
        <p className="m-0 font-medium leading-6 text-base">
          <ChuongCellRender ten={chuong?.ten} stt={chuong?.stt} />
        </p>
      </div>
      {authUser.is_sinh_vien && authUser.info && (
        <>
          <div className="d-flex mb-4">
            <p className="m-0 font-normal leading-6 text-base mr-2">Tên sinh viên:</p>
            <p className="m-0 font-medium leading-6 text-base">{authUser.info["name"]}</p>
          </div>
          <div className="d-flex mb-4">
            <p className="m-0 font-normal leading-6 text-base mr-2">MSSV:</p>
            <p className="m-0 font-medium leading-6 text-base">{authUser.info["mssv"]}</p>
          </div>
        </>
      )}
    </Card>
  );
};
