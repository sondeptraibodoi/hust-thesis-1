import { CallbackParams } from "@/hooks/useAgGrid";
import { FieldId } from "@/interface/common";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.post("list-hoc-phan-chuong", params),
  detail: (ma_hoc_phan: string) => sdk.post(`detail-hoc-phan-chuong/${ma_hoc_phan}`),
  showChuong: (id: any) => sdk.get(`hoc-phan-chuong/${id}`),

  showTaiLieu: (id: any) => sdk.get(`tai-lieu-chuong/${id}`),
  showChuongThongKe: (id: any) => sdk.get(`hoc-phan-chuong/${id}/thong-ke`),

  info: (ma_hoc_phan: string) => sdk.get(`info-hoc-phan-chuong/${ma_hoc_phan}`),

  create: (item: HocPhanChuong) => sdk.post("detail-create-hoc-phan-chuong", item),
  edit: (data: HocPhanChuong) => sdk.put(`detail-edit-hoc-phan-chuong/${data.id}`, data),
  delete: (id: number) => sdk.delete(`detail-delete-hoc-phan-chuong/${id}`),
  addTaiLieu: (params: any) =>
    sdk.post(`hoc-phan-chuong/upload-pdf/${params.id}`, params, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  deleteTaiLieu: (data: HocPhanChuong) => sdk.delete(`detail-delete-tai-lieu-chuong/${data.id}`),

  listChuongThiSV: (data: any) => sdk.post("list-chuong-thi-sv", data),
  //Thêm câu hỏi
  listCauHoiChuong: (params: any) => sdk.post("list-cau-hoi-hoc-phan", params),
  createCauHoi: (params: any) => sdk.post(`them-cau-hois`, params),
  updateCauHoi: (params: any) => sdk.put(`update-cau-hois/${params.id}`, params),
  deleteCauHoi: (id: number) => sdk.delete(`cau-hoi/${id}`),
  deleteChuDeForCauHoi: (id: FieldId, chuong_id: FieldId) => sdk.delete(`cau-hoi/${id}/chuongs/${chuong_id}`),
  listChuDeForCauHoi: (id: FieldId, params?: any) => sdk.get(`cau-hoi/${id}/chuongs`, { params }),
  makePrimaryChuDeForCauHoi: (id: FieldId, chuong_id: FieldId) => sdk.put(`cau-hoi/${id}/chuongs/${chuong_id}/chinh`),
  createChuDeForCauHoi: (id: FieldId, data: { chuong_id: FieldId; do_kho: string }) =>
    sdk.post(`cau-hoi/${id}/chuongs`, data)
};
