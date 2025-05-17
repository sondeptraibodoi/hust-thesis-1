import { ROLE } from "@/interface/user";

export function getBackEndUrl() {
  return import.meta.env.VITE_API_BASE_URL || "/";
}
export function getPrefix() {
  return import.meta.env.VITE_PREFIX || "/";
}
export const ROLE_CODE = {
  TEACHER: "teacher",
  ADMIN: "admin",
  STUDENT: "student",
  ASSISTANT: "assistant",
  HP_ASSISTANT: "hp_assistant",
  HP_OFFICE: "hp_office"
};

export const ROLE_NAME = {
  [ROLE.student]: "Sinh viên",
  [ROLE.admin]: "Quản trị",
  [ROLE.teacher]: "Giảng viên",
  [ROLE.assistant]: "Trợ lý",
  [ROLE.hp_assistant]: "Trưởng nhóm chuyên môn",
  [ROLE.hp_office]: "Trợ lý văn phòng"
};

export const STATUS_QUESTION = {
  MOI_TAO: "moi_tao",
  CHO_PHAN_BIEN: "cho_phan_bien",
  CHO_PHAN_BIEN2: "cho_phan_bien_lan_2",
  CHO_DUYET: "cho_duyet",
  CHO_DUYET1: "cho_duyet_lan_1",
  CHO_DUYET2: "cho_duyet_lan_2",
  TU_CHOI: "tu_choi",
  DANG_SU_DUNG: "dang_su_dung",
  CAN_SUA: "can_sua",
  SUA_DO_KHO: "can_sua_do_kho",
  PHE_DUYET_DO_KHO: "phe_duyet_do_kho",
  PHE_DUYET: "phe_duyet",
  HUY_BO: "huy_bo"
};

export * from "./_type";

export const LOAI_BAI_THI = {
  THI_THAT: "thi_that",
  THI_THU: "thi_thu"
};

export const LoaiLopThi = {
  Thi_2_GK: "thi_2_giua_ki",
  Thi_1_GK: "thi_1_giua_ki",
  Thi_GK_30: "thi_giua_ki_30",
  Thi_Theo_Chuong: "thi_theo_chuong"
};

export const LoaiLopThi_List = [
  {
    value: LoaiLopThi.Thi_2_GK,
    label: "Thi 2 lần giữa kì"
  },
  {
    value: LoaiLopThi.Thi_1_GK,
    label: "Thi 1 lần giữa kì"
  },
  {
    value: LoaiLopThi.Thi_GK_30,
    label: "Thi 1 lần điểm 30"
  },
  {
    value: LoaiLopThi.Thi_Theo_Chuong,
    label: "Thi theo chủ đề"
  }
];
