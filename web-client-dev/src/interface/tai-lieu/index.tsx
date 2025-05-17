import { User } from "../user";

export interface LoaiTaiLieu {
  id: number;
  ma: string;
  loai: string;
  nhom: string;
}

export interface TaiLieuChung {
  id: number;
  ma: string;
  ten: string;
  trang_thai: string;
  pham_vi: string;
  mo_ta: string;
  link: string;
  created_by: User;
  loai_tai_lieu: LoaiTaiLieu;
  created_by_id: number;
  loai_tai_lieu_id: any;
  created_at: string;
  show_giao_vien: boolean;
  show_sinh_vien: boolean;
}
