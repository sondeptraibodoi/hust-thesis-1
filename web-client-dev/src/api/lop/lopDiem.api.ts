import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { LopDiem } from "@/interface/lop";

export default {
  list: (params: CallbackParams) => sdk.post("lop-diem-list", params),
  delete: (item: LopDiem) => sdk.delete(`lop-diem/${item.id}`)
};
