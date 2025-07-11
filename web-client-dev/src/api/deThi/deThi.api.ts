import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.get(`list-de-thi`, {params}),
  post: (data: any) => sdk.post("de-thi", data),
  createRandom: (data: any) => sdk.post("de-thi-random", data),
  get: () => sdk.get("de-thi"),
  put: (data: any) => sdk.put(`de-thi/${data.id}`, data),
  delete: (data: any) => sdk.delete(`de-thi/${data.id}`, data),
  show: (data: any) => sdk.get(`de-thi/${data.id}`),
  getDethi: (data: any) => sdk.get(`lay-de-thi/${data}`)
};
