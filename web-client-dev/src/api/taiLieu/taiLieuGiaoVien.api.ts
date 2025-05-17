import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { TaiLieuChung } from "@/interface/tai-lieu";

export default {
  list: (params?: CallbackParams) => sdk.post("teacher-tai-lieu-list", params),
  create: (params: TaiLieuChung) => sdk.post(`teacher-them-tai-lieus`, params),
  update: (params: TaiLieuChung) => sdk.put(`teacher-tai-lieus/${params.id}`, params),
  delete: (item: any) => sdk.delete(`teacher-tai-lieus/${item.id}`),
  lopTaiLieu: (id: any) => sdk.get(`teacher-lop-list/${id}/tai-lieus`),
  addTaiLieuLop: (params: TaiLieuChung, lopId: number) => sdk.post(`teacher-them-tai-lieu-lop/${lopId}`, params),
  deleteTaiLieuLop: (item: any, lopId: number) => sdk.delete(`teacher-tai-lieus/${lopId}/${item.id}`),
  // copyTaiLieuLop: (params: any, lopId: number, lopTaiLieuId?: number) => {
  //   const url = lopTaiLieuId
  //     ? `teacher-copy-tai-lieu-lop/${lopId}/${lopTaiLieuId}`
  //     : `teacher-copy-tai-lieu-lop/${lopId}`;
  //   return sdk.post(url, params);
  // }
  copyTaiLieuLop: (params: any, lopId: number) => {
    sdk.post(`teacher-copy-tai-lieu-lop/${lopId}`, params);
  }
};
