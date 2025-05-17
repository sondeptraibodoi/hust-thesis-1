import { sdk } from "../axios";
import { downloadFromApiReturnKey } from "../download.api";

export default {
  cacheMaHp: (params: any) => sdk.get<string[]>("cache/lop-ma-hps", { params }).then((res) => res.data),
  excelDiemDanh: (data: any) =>
    sdk.post(`/export/lop-sinh-vien/${data.id}/excel`, data, {
      responseType: "blob"
    }),
  excelSinhVien: (data: any) =>
    sdk.post(`/export/sinh-vien-lop/${data.id}/excel`, data, {
      responseType: "blob"
    }),
  excelDiemDanhAll: (data: any) =>
    sdk.post(`/export/lop-sinh-vien-all/${data.id}/excel`, data, {
      responseType: "blob"
    }),
  excelSinhVienAll: (data: any) =>
    sdk.post(`/export/sinh-vien-lop-all/${data.id}/excel`, data, {
      responseType: "blob"
    }),
  diemThanhTich: (data: any) =>
    sdk.post(`/export/diem-thanh-tich/${data.id}/pdf`, data, {
      responseType: "blob"
    }),
  diemThanhTichAll: (data: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/diem-thanh-tich-all/${data.id}/pdf`, data);
    }),
  excelPhucKhao: (data: any) => sdk.post(`/export/phuc-khao/excel`, data, { responseType: "blob" }),
  excelXepLichThi: (data: any) => sdk.post(`/export/xep-lich-thi-gv/excel`, data, { responseType: "blob" }),
  excelThongKeDiemDanh: (data: any) =>
    sdk.post(`/export/thong-ke-diem-danh/excel`, data, {
      responseType: "blob"
    }),
  excelThiBu: (data: any) => sdk.post(`/export/thi-bu/excel`, data, { responseType: "blob" }),
  excelThongKeDiem: (data: any) =>
    sdk.post(`/export/thong-ke-diem/excel`, data, {
      responseType: "blob"
    }),
  excelDiemQT: (lop_id: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/diem-qt/${lop_id}`);
    }),
  excelDiemCK: (lop_id: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/diem-ck/${lop_id}`);
    }),
  excelAllDiem: (data: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/all-diem`, data);
    }),
  excelAllDiemQT: (data: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/all-diem-qt`, data);
    }),
  excelAllDiemCK: (data: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/all-diem-ck`, data);
    }),
  exportThongKeMaHocPhan: () =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/thong-ke-ma-hoc-phan`);
    })
};
