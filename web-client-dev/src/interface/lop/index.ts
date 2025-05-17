import { Dayjs } from "dayjs";
import { GiaoVien } from "../giaoVien";
import { SinhVien } from "../user";
import { FieldId } from "../common";

export interface Lop {
  ngay_mo_diem_danh: any;
  ngay_dong_diem_danh: any;
  tuan_hoc?: any;
  id: number;
  ma: string;
  ma_kem: string;
  ma_hp: string;
  ten_hp: string;
  phong: string;
  loai: string;
  kip: string;
  ki_hoc: string;
  ghi_chu: string;
  create_at: string;
  update_at: string;
  sinh_viens?: SinhVien[];
  giao_viens?: any;
  lan_diem_danhs?: LanDiemDanh[];
  parent?: Lop;
  children?: Lop[];
  count?: number | string;
  is_dai_cuong?: boolean;
  lop_id: number | string;
  ma_hoc_phan?: MaHocPhan;
  tai_lieus: any;
  hoc_phan_chuongs: any;
  hoc_phan_chuongs_count?: number;
  loai_thi?: string;
}
export interface LopSinhVien {
  ki_hoc: string;
  ma_lop: string;
  ma_hp: string;
  ten_hp: string;
}

export interface LanDiemDanh {
  id: number;
  lan: number;
  ngay_diem_danh: string | Dayjs;
  lop: Lop;
  lop_id: string | number;
  diem_danhs?: DiemDanh[];
  is_qua_han?: boolean;
  ngay_dong_diem_danh: string | Dayjs;
  ngay_mo_diem_danh: string | Dayjs;
}
export interface DiemDanh {
  id: string | number;
  lan_diem_danh_id?: string | number;
  lan_diem_danh?: LanDiemDanh;
  sinh_vien_id?: string | number;
  sinh_vien?: SinhVien;
  co_mat?: boolean;
  ghi_chu?: string;
}

export interface LopThiSinhVien {
  lop_thi_id: string | number;
  sinh_vien_id: string | number;
  stt: string | number;
  diem: string | number;
}

export interface DiemDanhItem {
  lan_diem_danh_id: string | number;
  diem_danh_id: string | number;
  sinh_vien_id: string | number;
  stt: number;
  lan: number;
  name: string;
  mssv: string;
  group: string;
  co_mat: boolean;
  ghi_chu: string;
}
export interface DiemYThuc {}

export interface LopThi {
  ki_hoc: string | number;
  id: number;
  ma: string;
  ma_hp: string;
  ten_hp: string;
  ma_lop?: string;
  ma_lop_thi: string;
  loai: any;
  lop_id?: number | string;
  lop_thi?: LopThi;
  lop?: Lop;
  sinh_viens: SinhVien;
  diem_count_not_null: number;
  diems_count: number;
}

export interface DiemDanhSinhVien {
  id: string;
  ma_lop: string;
  loai: string;
  lan: string;
  ngay_diem_danh: any;
  mssv: string;
  co_mat: boolean;
  ghi_chu: null;
}
export interface DiemThis {
  id: number;
  sinh_vien_id: number;
  lop_thi_id: number;
  diem: string;
  ghi_chu?: string | null;
  lop_id: number;
  loai: string;
}
export interface LoaiLopThi {
  value: string;
  title: string;
}

export interface LopThiKi {
  created_at: string;
  ghi_chu: string;
  giao_viens: { id: number; name: string; email: string }[];
  id: string | number;
  ki_hoc: string;
  kip_thi: string;
  loai: string;
  lop_id: string | number;
  ma: string;
  ma_hp: string;
  ma_kem: string;
  ngay_thi: string;
  phong: string;
  phong_thi: string;
  ten_hp: string;
  updated_at: string;
}

export interface lopCoiThiGiaoVienDetail {
  name: string;
  giao_vien_id: number;
  lop_thi_id: number;
  phong_thi: string;
  kip_thi: string;
  ngay_thi: string;
  ki_hoc: string;
  loai: string;
  ma_lop_thi: string;
  ma_lop_hoc: string;
  lop_id: number;
}
export interface SinhVienPhanBien {
  giao_vien: string;
  id: any;
  lop_id: string;
  ki_hoc: string;
  ma: string;
  ma_hp: string;
  ten_hp: string;
  sinh_vien_id: string;
  ten_cong_ty: string;
  dia_chi: string;
  mssv: string;
  ghi_chu: string;
  trang_thai: string;
  sinh_vien: string;
  ma_lop: string;
  ten_de_tai?: string;
  noi_dung?: string;
  cac_moc_quan_trong: string;
  giao_vien_hd?: string;
  giao_vien_pb?: string;
}
export interface SinhVienThucTap {
  giao_vien: string;
  id: any;
  lop_id: string;
  ki_hoc: string;
  ma: string;
  ma_hp: string;
  ten_hp: string;
  sinh_vien_id: string;
  ten_cong_ty: string;
  dia_chi: string;
  mssv: string;
  ghi_chu: string;
  trang_thai: string;
  sinh_vien: string;
  ma_lop: string;
  ten_de_tai?: string;
  noi_dung?: string;
  cac_moc_quan_trong: string;
  giao_vien_hd?: string;
  giao_vien_id?: string | number;
}
export interface MaHocPhan {
  id: number;
  ma: string;
  ten_hp: string;
  is_do_an: boolean;
  is_do_an_tot_nghiep: boolean;
  is_thuc_tap: boolean;
  created_at: string;
  updated_at: string;
}

export interface LanBaoCao {
  id: number;
  lan: number;
  ngay_bao_cao: string | Dayjs;
  giao_vien_id: string | number;
  ki_hoc: string;
  data?: any;
  loai: string;
}

export interface BaoCaoItem {
  do_an_bao_cao_id: string | number;
  lan_bao_cao_id: string | number;
  noi_dung_thuc_hien: string;
  noi_dung_da_thuc_hien: string;
  diem_y_thuc: string;
  diem_noi_dung: string;
  sinh_vien_id: string | number;
  mssv: string;
  name: string;
  lop_sinh_vien_do_an_id: string | number;
  ten_de_tai: string;
  noi_dung: string;
  cac_moc_quan_trong: string;
  ma_hp: string;
  ten_hp: string;
}
export interface LopSinhVienDoAn {
  id: number;
  lop_id: number;
  sinh_vien_id: number;
  giao_vien_id: number;
  ten_de_tai: string;
  noi_dung: string;
  cac_moc_quan_trong: string;
  sinh_vien: SinhVien;
  lop: Lop;
  giao_vien?: GiaoVien;
}

export interface DoAnBaoCao {
  id: number;
  lop_id: number;
  sinh_vien_id: number;
  giao_vien_id: number;
  sinh_vien: SinhVien;
  ngay_bao_cao: string | Dayjs;
  lan: string;
  ki_hoc: string;
  lop: Lop;
  giao_vien?: GiaoVien;
  noi_dung_thuc_hien: string;
  noi_dung_da_thuc_hien: string;
  diem_y_thuc: string;
  diem_noi_dung: string;
  ghi_chu: string;
}

export interface SinhVienChuongDiem {
  id: number;
  lop_id: number;
  chuong_id: number;
  sinh_vien_id: number;
  diem: string | number;
}
export interface LopDiem {
  id: FieldId;
  diem: number;
  lop_id: FieldId;
  sinh_vien_id: FieldId;
  loai: string;
  sinh_vien?: SinhVien;
  lop?: Lop;
}
export interface LopDiemList {
  id: FieldId;
  diem: number;
  lop_id: FieldId;
  sinh_vien_id: FieldId;
  loai: string;
  mssv: string;
  ki_hoc: string;
  ma_lop: string;
  ten_sinh_vien: string;
}
