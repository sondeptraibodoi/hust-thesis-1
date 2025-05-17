import { FieldId } from "../common";
import { GiaoVien } from "../giaoVien";
import { MaHocPhan } from "../lop";
import { User } from "../user";
import { HocPhanChuong } from "./chuong";

export interface HocPhanCauHoiChuong {
  cau_hoi?: any;
  cau_hoi_id: FieldId;
  chuong_id: FieldId;
  do_kho: string;
  ma_hoc_phan: string;
  chuong?: HocPhanChuong;
  is_primary?: boolean;
  ma_hp?: MaHocPhan;
  loai_thi?: HocPhanCauHoiLoai;
}
export interface HocPhanCauHoi {
  id: FieldId;
  noi_dung: string;
  loi_giai?: string;
  loai: string;
  lua_chon: { id: string; content: string }[];
  dap_an: string[];
  created_by_id: FieldId;
  created_by?: User;
  trang_thai: string;
  primary_chuong?: HocPhanCauHoiChuong;
  cau_hoi_phan_bien: HocPhanCauHoiPhanBien[];
  trang_thai_cau_hoi?: string;
  chuongs?: HocPhanCauHoiChuong[];
  phan_bien?: HocPhanCauHoiPhanBien;
  is_machine?: boolean;
}
export interface HocPhanCauHoiPhanBien {
  id: FieldId;
  giao_vien_id: FieldId;
  cau_hoi_id: FieldId;
  ngay_han_phan_bien: string;
  trang_thai_cau_hoi: string;
  ly_do: string;
  giao_vien?: GiaoVien;
}
export interface HocPhanCauHoiLoai {
  cau_hoi_id: FieldId;
  ma_hoc_phan: string;
  loai: "thi_thu" | "thi_that";
}
