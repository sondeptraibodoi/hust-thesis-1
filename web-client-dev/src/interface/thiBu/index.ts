export interface troLyThiBu {
  id: number;
  dot_thi: string;
  ki_hoc: string;
  lop_id: number;
  ly_do: string;
  name: string;
  phan_hoi: string | undefined;
  sinh_vien_id: number;
  ten_hp: string;
  trang_thai: string;
  image_urls: any;
}
export interface addThiBu {
  id?: any;
  sinh_vien_id?: number;
  ki_hoc: string;
  lop_id: number;
  dot_thi: string;
  ly_do: string;
  image: any[];
}
