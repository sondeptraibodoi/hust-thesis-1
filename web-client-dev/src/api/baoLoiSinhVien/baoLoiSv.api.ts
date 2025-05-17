import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  cache: () => sdk.get("bao-loi"),
  list: (params: CallbackParams) => sdk.post("bao-loi-list", params),
  create: (item: any) => sdk.post(`bao-loi`, item)
};
