import { sdk } from "../axios";

export default {
  list: (params?: any) => sdk.get("lop", {params}),
  create: (item: any) => sdk.post("lop", item),
  edit: (item: any) => sdk.put(`lop/${item.id}`, item),
  delete: (item: any) => sdk.delete(`lop/${item.id}`),
  show: (id: string | number) => sdk.get<any>(`lop/${id}`)
}
