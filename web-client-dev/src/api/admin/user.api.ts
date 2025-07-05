import { CallbackParams } from "@/hooks/useAgGrid";
import { User } from "@/interface/user/user";
import { sdk } from "../axios";

export default {
  list: (params: CallbackParams) => sdk.get(`tai-khoan`, {params}),
  create: (user: User) => sdk.post("tai-khoan", user),
  resetPassword: (user: User, value: any) => sdk.post(`users/${user.id}/reset-password`, value),
  edit: (user: User) => sdk.put(`tai-khoan/${user.id}`, user),
  delete: (user: User) => sdk.delete(`tai-khoan/${user.id}`),
  setinactive: (user: User) => sdk.put(`tai-khoan/${user.id}/inactive`),
  setactive: (user: any) => sdk.put(`tai-khoan-active/${user.id}`, user),
  editAdmin: (value: any) =>
    sdk.post(`editAdmin/profile`, value, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  listThongKeDuLieu: (kiHoc: string) => sdk.post(`thong-ke-du-lieu/${kiHoc}`)
};
