import { CallbackParams } from "@/hooks/useAgGrid";
import { TaiLieuChung } from "@/interface/tai-lieu";
import { sdk } from "../axios";

export default {
  quyDinh: (params?: CallbackParams) => sdk.post("tai-lieu-chungs", params),
  list: (params?: CallbackParams) => sdk.post("tai-lieus", params),
  create: (params: TaiLieuChung) => sdk.post(`them-tai-lieus`, params),
  update: (params: TaiLieuChung) => sdk.put(`tai-lieus/${params.id}`, params),
  delete: (item: any) => sdk.delete(`tai-lieus/${item.id}`)
};
