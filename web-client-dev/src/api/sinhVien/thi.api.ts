import { CauHoiBaiThi } from "@/interface/cauHoi";
import { FieldId } from "@/interface/common";
import { sdk } from "../axios";

export default {
  taiLieu: (id: FieldId) => sdk.get(`sinh-vien/hoc-phan-chuong/${id}`),
  thi: (params: { chuong_id: FieldId; loaiThi: string; lop_id?: FieldId; ma_hoc_phan: string; noSave?: boolean }) =>
    sdk.post<ThiApiReturn>(`sinh-vien/thi-hoc-phan-chuong`, params),
  submitAnswers: (params: { bai_thi_id?: FieldId; dap_ans: Record<FieldId, string[]>; chuong_id: FieldId }) =>
    sdk.post(`sinh-vien/thi-hoc-phan-chuong/nop-bai`, params),
  submitQuestion: (params: { bai_thi_id?: FieldId; cau_hoi_id: FieldId; dap_an: string[] }) =>
    sdk.post(`sinh-vien/thi-hoc-phan-chuong/nop-cau-hoi`, params)
};

export type ThiApiReturn = {
  items: CauHoiBaiThi[];
  bai_thi_id: FieldId;
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc: string;
};
