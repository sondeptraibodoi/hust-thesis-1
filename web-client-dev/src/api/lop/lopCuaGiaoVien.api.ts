import { AxiosResponse } from "axios";
import { CallbackParams } from "@/hooks/useAgGrid";
import { Lop } from "@/interface/lop";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.post("teacher-lop-list", params),
  getDetail: (id: string, params: any = {}) =>
    sdk.get<AxiosResponse<Lop>>(`teacher-lop-list/${id}`, { params }).then((res) => res.data)
};
