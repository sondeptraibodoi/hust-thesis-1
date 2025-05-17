import { MaHocPhan } from "../maHocPhan";

export interface HocPhanChuong {
  stt: number;
  id: number;
  ma_hoc_phan: string;
  ten: string;
  mo_ta: string;
  trang_thai: string;
  tuan_dong: string;
  tuan_mo: string;
  thoi_gian_thi: number;
  thoi_gian_doc: number;
  so_cau_hoi: number;
  diem_toi_da: number;
  created_at: string;
  updated_at: string;
  tai_lieus?: HpChuongTaiLieu[];
  ma_hp: MaHocPhan;
}

export interface HpChuongTaiLieu {
  id: number;
  chuong_id: number;
  ten: string;
  duong_dan: string;
  so_trang: string;
  duong_dan_xem: string;
  created_at: string;
  updated_at: string;
}
