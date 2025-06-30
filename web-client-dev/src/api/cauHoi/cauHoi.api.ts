import { CallbackParams } from "@/hooks/useAgGrid";
import { LaravelSuccessResponse } from "@/interface/axios/laravel";
import { FieldId } from "@/interface/common";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get(`list-cau-hoi`, {params}),
  update: (data: any) => sdk.put<LaravelSuccessResponse<HocPhanCauHoi>>(`cau-hoi/${data.id}`, data),
  post: (data: any) => sdk.post("cau-hoi", data),
  get: (data: any) => sdk.get("cau-hoi", { params: data }),
  put: (data: any) => sdk.put(`cau-hoi/${data.id}`, data),
  delete: (data: any) => sdk.delete(`cau-hoi/${data.id}`, data),
  listDanhGia: (params?: any) => sdk.get(`cau-hoi-danh-gia`, {params})
};

export const cauHoiTroLyApi = {
  copy: (id: FieldId, data: HocPhanCauHoi) =>
    sdk.put<LaravelSuccessResponse<HocPhanCauHoi>>(`cau-hoi-tro-ly/${id}/copy`, data)
};
