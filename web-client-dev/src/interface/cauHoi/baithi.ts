import { HocPhanCauHoi } from ".";

export type CauHoiBaiThi = {
  id: string | number;
  loai: string;
  lua_chon: HocPhanCauHoi["lua_chon"];
  noi_dung: string;
};

export type CauHoiBaiThiConvert = {
  id: string | number;
  content: string;
  answers: HocPhanCauHoi["lua_chon"];
  loai: string;
  stt: number;
};
