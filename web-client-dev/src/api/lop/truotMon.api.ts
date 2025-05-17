import { sdk } from "../axios";

export default {
  list: (id: number) => sdk.get(`list-truot-mon/${id}`),
  addSV: (data: any) => sdk.post(`add-truot-mon`, data),
  updateSV: (data: any) => sdk.put(`update-truot-mon/${data.id}`, data),
  deleteSV: (data: any) => sdk.post(`delete-truot-mon/${data.id}`, data)
};
