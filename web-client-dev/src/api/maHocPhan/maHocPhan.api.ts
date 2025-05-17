import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { MaHocPhan } from "@/interface/maHocPhan";

export default {
  cache: () => sdk.get<MaHocPhan[]>("cache/maHocPhan"),
  list: (params?: CallbackParams) => sdk.post("ma-hoc-phan-list", params),
  create: (item: MaHocPhan) => sdk.post("maHocPhan", item),
  edit: (item: MaHocPhan) => sdk.put(`maHocPhan/${item.id}`, item),
  delete: (item: MaHocPhan) => sdk.delete(`maHocPhan/${item.id}`),
  getDetail: (id: string | number, params: any = {}) => sdk.get<MaHocPhan>(`maHocPhan/${id}`, { params })
};
