export interface TaiLieuHocPhan {
  hoc_phans: any;
  id: number;
  ma: string;
  ten: string;
  trang_thai: string;
  pham_vi: string;
  mo_ta: string;
  link: string;
  created_by: {
    id: number;
    username: string;
    roles: [""];
  };
  loai_tai_lieu: {
    id: 1;
    ma: string;
    loai: string;
  };
  created_by_id: number;
  ma_hoc_phan: string;
}
export interface TaiLieu {
  id: number;
  link: string;
  loai_tai_lieu_id: number;
  ma: string;
  mo_ta: string;
  pham_vi: string;
  ten: string;
  trang_thai: string;
  updated_at: string;
  created_at: string;
  created_by_id: number;
}
