import { CallbackParams } from "@/hooks/useAgGrid";
import { NhiemVu } from "@/interface/user";
import { sdk } from "../axios";

export default {
  list: (params: CallbackParams) => sdk.post("nhiem-vus", params),
  listPhucKhao: (params: CallbackParams) => sdk.post("nhiem-vus", params),
  listGiaoViens: () => sdk.get("giao-vien"),
  create: (params: NhiemVu) => sdk.post(`them-nhiem-vus`, params),
  update: (params: NhiemVu) => sdk.put(`nhiem-vus/${params.id}`, params),
  delete: (item: any) => sdk.delete(`nhiem-vus/${item.id}`)
};
