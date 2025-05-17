import { CallbackParams } from "@/hooks/useAgGrid";
import { PhucKhao } from "@/interface/phucKhao";
import { sdk } from "../axios";

export default {
  cache: () => sdk.get("cache/phuc-khao"),
  list: (params: CallbackParams) => sdk.post("admin/phuc-khao", params),
  listNhiemVu: (params: CallbackParams) => sdk.post("phuc-khao-nhiem-vu", params),
  delete: (item: PhucKhao) => sdk.delete(`admin/phuc-khao/${item.id}`),
  edit: (item: Partial<PhucKhao>) => sdk.put(`admin/phuc-khao/${item.id}`, item)
};
