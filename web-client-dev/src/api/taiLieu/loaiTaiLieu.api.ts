import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { LoaiTaiLieu } from "@/interface/tai-lieu";

export default {
  list: (params?: CallbackParams) => sdk.post("loai-tai-lieu-list", params),
  create: (item: LoaiTaiLieu) => sdk.post("loaiTaiLieu", item),
  edit: (item: LoaiTaiLieu) => sdk.put(`loaiTaiLieu/${item.id}`, item),
  delete: (item: LoaiTaiLieu) => sdk.delete(`loaiTaiLieu/${item.id}`)
};
