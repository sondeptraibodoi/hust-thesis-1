import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: any) => sdk.get("phan-mon", {params}),
  create: (item: any) => sdk.post("phan-mon", item),
  edit: (item: any) => sdk.put(`phan-mon/${item.id}`, item),
  delete: (item: any) => sdk.delete(`phan-mon/${item.id}`),
  show: (id: string | number) => sdk.get<any>(`phan-mon/${id}`),
  listClass: (params?: CallbackParams) => sdk.get("phan-lop", {params}),
  createClass: (item: any) => sdk.post("phan-lop", item),
  editClass: (item: any) => sdk.put(`phan-lop/${item.id}`, item),
  deleteClass: (item: any) => sdk.delete(`phan-lop/${item.id}`),
  showClass: (id: string | number) => sdk.get<any>(`phan-lop/${id}`)
};
