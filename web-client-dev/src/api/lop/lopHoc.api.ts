import { CallbackParams } from "@/hooks/useAgGrid";
import { FieldId } from "@/interface/common";
import { Lop } from "@/interface/lop";
import { SinhVien } from "@/interface/user";
import { downloadFromApiReturnKey } from "../download.api";
import { sdk } from "../axios";

export default {
  cache: () => sdk.get<Lop[]>("cache/lop"),
  list: (params: CallbackParams) => sdk.post("lop-list", params),
  get: () => sdk.get("lop-list-student"),
  getDetail: (id: string | number, params: any = {}) => sdk.get<Lop>(`lop/${id}`, { params }),
  create: (item: Lop) => sdk.post("lop", item),
  edit: (item: Lop) => sdk.put(`lop/${item.id}`, item),
  delete: (item: Lop) => sdk.delete(`lop/${item.id}`),
  detail: (id: number) => sdk.post(`lop-detail/${id}`),
  listSinhVien: (id: FieldId) => sdk.get<SinhVien[]>(`lop/${id}/sinh-viens`),
  listSinhVienWithDiem: (id: FieldId) =>
    sdk.get<
      SinhVien &
        {
          diem: {
            GK: string;
            DIEM_CHUYEN_CAN: string;
            DIEM_CK: any;
            DIEM_LT: any;
            DIEM_LT_LOAI: string;
          };
          pivot: {
            lop_id: number;
            sinh_vien_id: number;
            stt: number;
            diem_y_thuc: any;
            nhom: string;
            diem: string;
          };
        }[]
    >(`lop/${id}/thong-ke-diem-chuong`),
  addSV: (data: any) => sdk.post(`lop-detail/add-student/${data.id}`, data),
  updateSV: (data: any) => sdk.post(`lop-detail/update-student/${data.id}`, data),

  removeSV: (data: any) => sdk.post(`lop-detail/remove-student/${data.id}`, data),
  exportStudent: (data: any) =>
    sdk.post(`/export/lop-sinh-vien/${data.id}/sinh-viens`, data, {
      responseType: "blob"
    }),
  exportLopLt: (data: any) =>
    downloadFromApiReturnKey(() => {
      return sdk.post(`/export/lop-li-thuyet/${data.id}/lop-lt`, data);
    }),
  item: (id: string | number, params: any = {}) => sdk.get<Lop>(`student-lop-list-item/${id}`, { params }),
  sinhVienLopHoc: (id: string | number, params: any = {}) => sdk.get<SinhVien[]>(`sinh-vien-lop-hoc/${id}`, { params }),
  lopGiaoVien: (data: any) => sdk.get(`lop-teacher/${data.id}`, { params: data }),
  listLopDiemDanh: (params: any) => sdk.post<Lop[]>("lop-list-diem-danh", params),

  listSinhVienExtras: (id: number, lop_id: number) =>
    sdk.get<SinhVien[]>(`lop/${id}/sinh-vien_extras`, {
      params: {
        lop_id
      }
    }),
  addSVExtras: (params: any) => sdk.post("add-student-extras", params),
  updateSVExtras: (data: any) => sdk.put(`update-student-extras/${data.id}`, data),
  removeSVExtras: (data: any) => sdk.post(`delete-student-extras`, data),
  addSVTruotMonExtras: (data: any) => sdk.post(`/lop-sinh-vien-extras/sinh-vien-truot-mon`, data),
  listSVTruotMon: (params?: CallbackParams) => sdk.post("lop-sinh-vien-extras/truot-mon-records", params),
  updateSVTruotMon: (data: any) => sdk.put(`update-student-truot/${data.sv_id}`, data),
  addSVDoAn: (data: any) => sdk.post(`lop-detail/add-student-do-an/${data.id}`, data),
  updateSVDoAn: (data: any) => sdk.post(`lop-detail/update-student-do-an/${data.id}`, data),
  removeSVDoAn: (data: any) => sdk.post(`lop-detail/remove-student-do-an/${data.id}`, data)
};
