import { CallbackParams } from "@/hooks/useAgGrid";
import { LaravelSuccessResponse } from "@/interface/axios/laravel";
import { FieldId } from "@/interface/common";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { sdk } from "../axios";

export default {
  list: (data?: CallbackParams) => sdk.post(`list-cau-hoi`, data),
  update: (data: any) => sdk.put<LaravelSuccessResponse<HocPhanCauHoi>>(`cau-hoi/${data.id}`, data),
  post: (data: any) => sdk.post("cau-hoi", data),
  get: () => sdk.get("cau-hoi"),
  put: (data: any) => sdk.put(`cau-hoi/${data.phan_bien_id}`, data),
  setPhanBien: (id: FieldId, data: any) => sdk.post(`cau-hoi/${id}/phan-bien`, data),
  listCauHoiGv: (params?: any) => sdk.post("list-cau-hoi-giao-vien", params),
  cauHoiLogs: (id: FieldId) => sdk.post(`cau-hois/${id}/logs-list`),
  showCauHoiGv: (id: FieldId) => sdk.get(`giao-vien/cau-hoi/${id}`),
  getDetail: (id: FieldId, params: any) => sdk.get(`cau-hoi/${id}`, { params }),
  showCauHoiTroLyHp: (id: FieldId) => sdk.get(`tro-ly-hoc-phan/cau-hoi/${id}`),
  listChuong: (maHp: any) => sdk.get(`list-hoc-phan-chuong/${maHp}`),
  createCauHoi: (params: any) => sdk.post(`cau-hoi-giao-vien`, params),
  updateCauHoi: (params: any) => sdk.put(`cau-hoi-giao-vien/${params.id}`, params),
  deleteCauHoi: (id: FieldId) => sdk.delete(`cau-hoi-giao-vien/${id}`),
  sendPheDuyet: (id: FieldId) => sdk.put(`cau-hoi-giao-vien/${id}/yeu-cau-phe-duyet`),
  huyCauHoi: (id: FieldId, data?: any) => sdk.put(`cau-hoi/${id}/huy-bo`, data),
  listCauHoiPhanBienGv: (params?: any) => sdk.post("cau-hoi-phan-bien-gv", params),
  sendPhanBien: (id: FieldId, params: any) => sdk.put(`cau-hoi-phan-bien-gv/${id}/phan-bien`, params),
  createCauHois: (params: any) => sdk.post(`cau-hois-giao-vien`, params),
  listPhanBien: (id: FieldId, params?: any) => sdk.get(`cau-hoi/${id}/phan-bien`, { params }),
  listCauHoiTroLy: (data?: CallbackParams) => sdk.post(`list-cau-hoi-tro-ly`, data),
  cauHoiTroLyDetail: (id: FieldId) => sdk.get(`cau-hoi/${id}`),
  suaDoKhoCauHoi: (id: FieldId) => sdk.put(`cau-hoi/${id}/sua-do-kho`),
  doiTrangThaiCauHoi: (params: any) => sdk.put(`cau-hoi-tro-ly/${params.cau_hoi_id}`, params),
  duyetDoKhoCauHoi: (data: any) => sdk.put(`cau-hoi/${data.id}/phe-duyet-do-kho`, data),
  ganLoaiThi: (params: any) => sdk.post(`cau-hoi-tro-ly/loai-thi`, params)
};

export const cauHoiTroLyApi = {
  copy: (id: FieldId, data: HocPhanCauHoi) =>
    sdk.put<LaravelSuccessResponse<HocPhanCauHoi>>(`cau-hoi-tro-ly/${id}/copy`, data)
};
