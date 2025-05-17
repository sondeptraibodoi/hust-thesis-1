import { addThiBu } from "@/interface/thiBu";
import { sdk } from "../axios";
import { CallbackParams } from "@/hooks/useAgGrid";
export default {
  list: (params?: CallbackParams) => sdk.post("thi-bu-sv", params),
  detail: (item: addThiBu) => sdk.get(`thi-bu-sv/${item.id}`),
  add: (item: any) =>
    sdk.post("thi-bu", item, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  // addImage: (id: number) =>
  //   sdk.post(`thi-bu/${id}/images`, {
  //     headers: { "Content-Type": "multipart/form-data" }
  //   }),
  addImage: (item: any) =>
    sdk.post("thi-bu/image", item, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  put: (item: addThiBu) =>
    sdk.post(`thi-bu-update/${item.id}`, item, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  delete: (id: number) => sdk.delete(`thi-bu/${id}`),
  deleteImage: (id: number, image_id: number) => sdk.delete(`thi-bu/${id}/image/${image_id}`),
  getHocPhan: () => sdk.get("student-lop-hp")
};
