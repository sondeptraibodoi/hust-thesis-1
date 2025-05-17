import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { addThiBu } from "@/interface/thiBu";

export default {
  list: (params?: CallbackParams) => sdk.post(`list-thi-bu`, params),
  detail: (item: addThiBu) => sdk.get(`detail-thi-bu/${item.id}`),
  edit: (item: any) => sdk.put(`update-thi-bu/${item.id}`, item)
};
