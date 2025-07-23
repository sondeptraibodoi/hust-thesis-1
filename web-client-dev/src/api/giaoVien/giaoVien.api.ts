import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get("giao-vien", {params}),
  create: (item: any) => sdk.post("giao-vien", item),
  edit: (item: any) => sdk.put(`giao-vien/${item.id}`, item),
  delete: (item: any) => sdk.delete(`giao-vien/${item.id}`),
  getDetail: (id: string | number) => sdk.get<any>(`giao-vien/${id}`),
  show: (id: string | number) => sdk.get<any>(`giao-vien/${id}`)
};
