import { FieldId } from "../common";

export interface HocPhanCauHoi {
  info: any;
  created_by: any;
  id: number;
  noi_dung: string;
  loai: string;
  lua_chon: { id: string; content: string; correct?: boolean }[];
  dap_an: string[];
  created_by_id: number;
  trang_thai: string;
  primary_chuong: CauHoiChuong;
  cau_hoi_phan_bien: CauHoiPhanBien[];
  cau_hoi?: any;
  cau_hoi_id: FieldId;
  ngay_han_phan_bien?: string;
  ly_do?: string;
  trang_thai_cau_hoi?: string;
  chuongs?: any;
  loai_thi?: any;
}
export interface CauHoiChuong {
  ma_hoc_phan: string;
  cau_hoi_id: number;
  chuong_id: number;
  do_kho: string;
  chuong: any;
}
export interface CauHoiPhanBien {
  id: number;
  giao_vien_id: number;
  cau_hoi_id: number;
  ngay_han_phan_bien: any;
  trang_thai_cau_hoi: string;
  ly_do: string;
}

export interface PhanBien {
  cau_hoi_id: number;
  giao_vien: any;
  giao_vien_id: number;
  id: number;
  lan: number;
  ngay_han_phan_bien: string;
  ngay_phe_duyet: string;
  trang_thai_cau_hoi: string;
  created_at: string;
  updated_at: string;
  ly_do: string;
}
export * from "./baithi";
