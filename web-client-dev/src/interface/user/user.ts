import { Dayjs } from "dayjs";

export interface User {
  id: string | number;
  avatar_url?: string;
  username: string;
  vai_tro: ROLE,
  created_at: string;
  updated_at: string;
  hoc_phan_quan_ly?: any;
}

export interface SinhVien {
  note: string;
  ma: string;
  id: string | number;
  user?: {
    info?: {
      id?: number;
    };
  };

  name?: string;
  email: string;
  mssv: string;
  birthday?: string | Dayjs;
  group?: string;
  created_at: string;
  updated_at: string;
  nhom?: any;
  diem_y_thuc?: number | string;
  stt?: number;
  diem?: number;

  pivot?: {
    diem?: number;
    stt?: number;
    diem_y_thuc?: number;
    nhom?: string;
    sinh_vien_id?: string;
    note?: string;
    lop_id?: string;
  };

  sinh_vien_extras?: any;
  ten_hp?: string;
  ma_lop?: string;
  ma_hp?: string;
  id_lop?: string;
  sv_id?: string;

  giaoVienHD?: {
    name?: string;
    id?: number;
    email?: string;
  };

  giao_vien_huong_dan?: any;
  ten_de_tai?: any;
  noi_dung?: any;
  cac_moc_quan_trong?: any;

  lopSVDoAn?: {
    ten_de_tai?: string;
    noi_dung?: string;
    cac_moc_quan_trong?: string;
  };
}
export enum ROLE {
  student = "sinh_vien",
  admin = "admin",
  teacher = "giang_vien",
  assistant = "assistant",
  hp_assistant = "hp_assistant",
  hp_office = "hp_office"
}

export interface UserTeacherInfo {
  name: string;
  email: string;
}
export interface UserStudentInfo {
  name: string;
  email: string;
  mssv: string;
  group: string;
}

export interface EmailForgotPassword {
  username: string | number;
}

export interface ResetPassword {
  token: any;
  password: string;
  "confirm-password": string;
}
export interface NhiemVu {
  id: string | number;
  loai: string;
  ngay_het_hieu_luc: string;
  nguoi_lam: string;
  nguoi_lam_id: number;
  nguoi_tao: string;
  nguoi_tao_id: number;
  noi_dung: string;
  tieu_de: string;
  trang_thai: string;
}
export interface DataCreateNhiemVu {
  nguoi_lam_id: number;
  tieu_de: string;
  noi_dung: {
    ngay_ket_thuc_phuc_khao: string;
    ngay_bat_dau_phuc_khao: string;
    ma_hoc_phan: string;
    ki_hoc: string;
  };
}
