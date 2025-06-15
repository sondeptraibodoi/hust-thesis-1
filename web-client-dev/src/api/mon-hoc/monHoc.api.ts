import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: () => sdk.get("danh-sach-mon"),
  create: (item: any) => sdk.post("mon", item),
  edit: (item: any) => sdk.put(`mon/${item.id}`, item),
  delete: (item: any) => sdk.delete(`mon/${item.id}`),
  getDetail: (id: string | number, params: any = {}) => sdk.get<any>(`mon/${id}`, { params })
};
