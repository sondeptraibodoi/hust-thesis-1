import { sdk } from "../axios";

export default {
  list: () => sdk.get("cache"),
  getListLop: () => sdk.get(`cache/lop`).then((res) => res.data),
  getListLopThi: (param: any) => sdk.post(`lop-thi-sv`, param)
};
