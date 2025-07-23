import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get("sinh-vien", {params}),
  create: (item: any) => sdk.post("sinh-vien", item),
  edit: (item: any) => sdk.put(`sinh-vien/${item.id}`, item),
  delete: (item: any) => sdk.delete(`sinh-vien/${item.id}`),
  getDetail: (id: string | number) => sdk.get<any>(`sinh-vien/${id}`),
  show: (id: string | number) => sdk.get<any>(`sinh-vien/${id}`)
};
