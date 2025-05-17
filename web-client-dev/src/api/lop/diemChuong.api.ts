import { sdk } from "../axios";

export default {
  list: (id: number | string) => sdk.get(`diem-thi-chuong/${id}`),
  show: (id: number | string) => sdk.get(`bieu-do-diem-thi-chuong/${id}`)
};
