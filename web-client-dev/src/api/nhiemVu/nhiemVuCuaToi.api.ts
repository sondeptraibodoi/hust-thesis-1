import { sdk } from "../axios";

export default {
  list: () => sdk.get("nhiem-vu-cua-toi").then((res) => ({ data: res.data })),
  show: (id: string) => sdk.get("nhiem-vu-cua-toi/" + id),
  update: (id: string, data: any) => sdk.put("nhiem-vu-cua-toi/" + id, data)
};
