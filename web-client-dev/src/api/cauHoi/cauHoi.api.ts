import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get(`list-cau-hoi`, {params}),
  post: (data: any) => sdk.post("cau-hoi", data),
  get: (data: any) => sdk.get("cau-hoi", { params: data }),
  put: (data: any) => sdk.put(`cau-hoi/${data.id}`, data),
  delete: (data: any) => sdk.delete(`cau-hoi/${data.id}`, data),
  listDanhGia: (params?: any) => sdk.get(`cau-hoi-danh-gia`, {params})
};
