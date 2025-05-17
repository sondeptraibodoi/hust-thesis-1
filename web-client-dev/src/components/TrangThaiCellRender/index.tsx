import { FC } from "react";

import { STATUS_QUESTION } from "@/constant";
import { Tag } from "antd";
import { renderMath } from "./utils";

export const DoKhoCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  switch (data) {
    case "medium":
      return <Tag color="#00c8a6 ">Trung bình</Tag>;
    case "hard":
      return <Tag color="#f50628">Khó</Tag>;
    default:
      return <Tag color="#416ee3">Dễ</Tag>;
  }
};

export const TrangThaiCauHoiCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }

  switch (data) {
    case STATUS_QUESTION.CHO_PHAN_BIEN:
      return <Tag className="text-cyan-600 bg-yellow-200">Chờ phản biện</Tag>;
    case STATUS_QUESTION.CHO_PHAN_BIEN2:
      return <Tag color="#968eee">Chờ phản biện lần 2</Tag>;
    case STATUS_QUESTION.CHO_DUYET1:
      return <Tag color="#00c8a6">Chờ duyệt lần 1</Tag>;
    case STATUS_QUESTION.CHO_DUYET2:
      return <Tag color="#c27dbe">Chờ duyệt lần 2</Tag>;
    case STATUS_QUESTION.PHE_DUYET:
      return <Tag color="#87d068">Phê duyệt</Tag>;
    case STATUS_QUESTION.TU_CHOI:
      return <Tag color="#f50628">Từ chối</Tag>;
    case STATUS_QUESTION.DANG_SU_DUNG:
      return <Tag color="#416ee3">Đang sử dụng</Tag>;
    case STATUS_QUESTION.SUA_DO_KHO:
      return <Tag color="#FF6633">Cần sửa độ khó</Tag>;
    case STATUS_QUESTION.PHE_DUYET_DO_KHO:
      return <Tag color="#08829f">Chờ phê duyệt độ khó</Tag>;
    case STATUS_QUESTION.MOI_TAO:
      return <Tag>Mới tạo</Tag>;
    case STATUS_QUESTION.CAN_SUA:
      return <Tag color="error">Cần sửa</Tag>;
    case STATUS_QUESTION.HUY_BO:
      return <Tag color="error">Hủy bỏ</Tag>;
    default:
      return <Tag>{data}</Tag>;
  }
};

export const TrangThaiPhanBienCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  switch (data) {
    case "cho_duyet":
      return <Tag color="#00c8a6">Chờ duyệt</Tag>;
    case "tu_choi":
      return <Tag color="error">Từ chối</Tag>;
    case "phe_duyet":
      return <Tag color="#87d068">Phê duyệt</Tag>;
  }
  return <div>{data.cau_hoi?.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi}</div>;
};
export const GiaoVienTaoCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  if (data.cau_hoi.created_by.info?.name) {
    return <span>{data.cau_hoi.created_by.info?.name}</span>;
  } else {
    return <div>{data.cau_hoi.created_by.username}</div>;
  }
};
export const GiaoVienPhanBienCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return <div>{data.cau_hoi?.cau_hoi_phan_bien[0]?.giao_vien?.name}</div>;
};

export const CauHoiCellRender: FC<{ data: string; className?: any }> = ({ data, className }) => {
  if (!data) {
    return <span></span>;
  }
  return <div className={className}>{renderMath(data)}</div>;
};

export const LoaiCauHoiCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  switch (data.loai || data.cau_hoi?.loai) {
    case "multi":
      return <Tag color="purple">Nhiều đáp án</Tag>;
    case "single":
      return <Tag color="purple">Một đáp án</Tag>;
    default:
      return <Tag color="#416ee3">{data.loai}</Tag>;
  }
};

export const LoaiThiCellRender: FC<{ data?: string }> = ({ data }) => {
  if (!data) {
    return <Tag color="purple">Thi thật</Tag>;
  }
  switch (data) {
    case "thi_thu":
      return <Tag color="magenta">Thi thử</Tag>;
    case "thi_that":
      return <Tag color="purple">Thi thật</Tag>;
    default:
      return;
  }
};

export const ChuongCellRender: FC<{ ten?: string; stt?: number }> = ({ stt, ten }) => {
  if (!ten) {
    return "";
  }
  if (!stt) {
    return ten;
  }
  return `CĐ ${stt} - ${ten}`;
};
