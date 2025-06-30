import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (data?: CallbackParams) => sdk.post(`hoc-phan-bai-thi`, data),
  baiThiDetail: (id: any) => sdk.get(`hoc-phan-bai-thi/${id}`),
  delete: (data?: any) => sdk.delete(`hoc-phan-bai-thi/${data.id}`),
  nopBai: (data: any) => sdk.post('nop-bai', data)
};
