
import { sdk } from "./axios";

export default {
  getSetting: () => sdk.get("config/setting"),
  getSettingBaoCao: (ki_hoc: string) => sdk.get("config/bao-cao", { params: { ki_hoc } }),
  updateSettingBaoCao: (ki_hoc: string, data: any) => sdk.post("config/bao-cao/" + ki_hoc, data),
  updateHust: (data: any) => sdk.post("config/hust", data),
  createDongDiemDanh: (data: any) => sdk.post("config/dong-diem-danh", data),
  createDongBaoCao: (data: any) => sdk.post("config/dong-bao-cao", data),
  listDongDiemDanh: (data: any) => sdk.post("config/list-dong-diem-danh", data),
  listDongBaoCao: (data: any) => sdk.post("config/list-dong-bao-cao", data),
  listTimKiem: (data: any) => sdk.post("config/lich-hoc", data),
  listTimKiemBaoCao: (data: any) => sdk.post("config/lich-hoc-bao-cao", data),
  editDongDiemDanh: (data: any) => sdk.put(`config/dong-diem-danh/${data.id}`, data),
  editDongBaoCao: (data: any) => sdk.put(`config/dong-bao-cao/${data.id}`, data),
  deleteDongDiemDanh: (data: any) => sdk.delete(`config/dong-diem-danh/${data.id}`),
};
