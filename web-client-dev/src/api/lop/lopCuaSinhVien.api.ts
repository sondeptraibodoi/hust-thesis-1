import { CallbackParams } from "@/hooks/useAgGrid";
import { FieldId } from "@/interface/common";
import { sdk } from "../axios";

export default {
  list: (params?: CallbackParams) => sdk.post("student-lop-list", params),
  getDetail: (id: FieldId, params?: any) => sdk.get(`student-lop-list/${id}`, { params }),
  getDiemDanh: (id: any) => sdk.get(`student-diem-danh-list/${id}`),
  getDiemThis: (id: any) => sdk.get(`lop/${id}/sinh-vien-diem`),
  getBaoCao: (id: any) => sdk.get(`student-bao-cao-list/${id}`)
};
