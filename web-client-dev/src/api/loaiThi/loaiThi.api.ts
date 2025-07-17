import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get("loai-thi", {params}),
  create: (item: any) => sdk.post("loai-thi", item),
  edit: (item: any) => sdk.put(`loai-thi/${item.id}`, item),
  delete: (item: any) => sdk.delete(`loai-thi/${item.id}`),
  show: (id: string | number) => sdk.get<any>(`loai-thi/${id}`)
};
