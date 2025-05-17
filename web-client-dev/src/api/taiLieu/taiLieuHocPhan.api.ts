import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { TaiLieuHocPhan } from "@/interface/taiLieu";

export default {
  list: (params?: CallbackParams) => sdk.post("list-tai-lieu-hoc-phan", params),
  create: (item: any) => sdk.post(`add-tai-lieu-hoc-phan`, item),
  update: (item: any) => sdk.put(`tai-lieu-hoc-phan/${item.id}`, item),
  delete: (item: TaiLieuHocPhan) => sdk.delete(`delete-tai-lieu-hoc-phan/${item.id}`)
};
