import { HocPhanUser } from "@/interface/hoc-phan";
import { TaiLieuHocPhan } from "@/interface/taiLieu";
import { sdk } from "../axios";
export default {
  list: (hoc_phan: HocPhanUser) => sdk.post("tai-lieu-hoc-phan-theo-ma", hoc_phan),
  create: (item: TaiLieuHocPhan) => sdk.post("quan-ly-hoc-phan", item),
  copy: (hoc_phan: HocPhanUser, hp_Id: number) => {
    sdk.post(`copy-tai-lieu-hoc-phan/${hp_Id}`, hoc_phan);
  },
  edit: (item: TaiLieuHocPhan) => sdk.put(`tai-lieu-hoc-phan`, item),
  delete: (id_tai_lieu: number, ma_hp: string) => sdk.delete(`tai-lieu/${ma_hp}/${id_tai_lieu}`)
};
