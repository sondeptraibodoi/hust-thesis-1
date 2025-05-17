import { Lop } from "../lop";

export interface MaHocPhan {
  ten_hp: string;
  id: number;
  ma: string;
  is_do_an?: boolean;
  is_do_an_tot_nghiep?: boolean;
  is_thuc_tap?: boolean;
  lops?: Lop[];
}

export interface HpUser {
  user_id: number | string;
  ma_hoc_phan: string;
}
