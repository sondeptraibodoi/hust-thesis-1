import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get("danh-sach-mon", {params}),
  create: (item: any) => sdk.post("mon", item),
  edit: (item: any) => sdk.put(`mon/${item.id}`, item),
  delete: (item: any) => sdk.delete(`mon/${item.id}`),
  getDetail: (id: string | number) => sdk.get<any>(`mon/${id}`),
  show: (id: string | number) => sdk.get<any>(`mon-hoc/${id}`)
};
