import { LaravelSuccessResponse } from "@/interface/axios/laravel";
import { sdk } from "../axios";
import { DoAnBaoCao, LopSinhVienDoAn } from "@/interface/lop";

export default {
  list: (lop_id: number, sinh_vien_id: number) =>
    sdk.get<DoAnBaoCao[]>(`do-an/danh-gia/${lop_id}/${sinh_vien_id}`).then((x) => x.data),
  create: (data: any) => sdk.post<DoAnBaoCao>(`do-an/danh-gia-sinh-vien`, data).then((res) => res.data),
  edit: (item: DoAnBaoCao) => sdk.put(`do-an/danh-gia-sinh-vien/${item.id}`, item),
  delete: (item: DoAnBaoCao, params: any = {}) => sdk.delete(`do-an/danh-gia-sinh-vien/${item.id}`, { params }),
  show: (lop_id: number, sinh_vien_id: number) =>
    sdk
      .get<LaravelSuccessResponse<LopSinhVienDoAn>>(`do-an/thong-tin-sinh-vien-do-an/${lop_id}/${sinh_vien_id}`)
      .then((x) => x.data)
};
