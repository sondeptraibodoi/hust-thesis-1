import { SinhVienThucTap } from "@/interface/lop";
import { sdk } from "../axios";
import { CallbackParams } from "@/hooks/useAgGrid";

export default {
  getThucTap: (id: any) => sdk.get(`lop/${id}/sv-thuc-tap`),
  create: (item: SinhVienThucTap) => sdk.post(`add-sv-thuc-tap`, item),
  edit: (item: SinhVienThucTap) => sdk.put(`edit-sv-thuc-tap/${item.id}`, item),
  delete: (item: SinhVienThucTap) => sdk.delete(`delete-sv-thuc-tap/${item.id}`),

  //tro ly phe duyet
  listThucTap: (id: any) => sdk.get(`lop/${id}/list-thuc-tap`),
  duyetThucTap: (params: any) => sdk.put(`duyet-sv-thuc-tap/${params.id}`, params),
  listThucTapPage: (params?: any) => sdk.post(`admin/list-thuc-tap`, params),
  listPhanBienPage: (params?: any) => sdk.post(`admin/list-phan-bien`, params),
  listDoAnPage: (params?: any) => sdk.post(`admin/list-do-an`, params),
  adminEditDoAn: (item: any) => sdk.put(`admin/edit-sv-do-an/${item.id}`, item),
  excelDoAn: (data: any) => sdk.post(`/admin/export/do-an/excel`, data, { responseType: "blob" }),

  excelThucTap: (data: any) => sdk.post(`/admin/export/thuc-tap/excel`, data, { responseType: "blob" }),

  //giao vien phe duyet
  listThucTapDoAn: (params?: CallbackParams) => sdk.post(`list-thuc-tap-do-an`, params),
  listThucTapByGv: (params?: any) => sdk.post(`list-thuc-tap-giao-vien`, params),
  listDoAnTotNghiep: (params?: CallbackParams) => sdk.post(`list-do-an-tot-nghiep`, params),
  editDoAn: (item: any) => sdk.put(`edit-sv-do-an/${item.id}`, item),
  editDoAnTotNghiep: (item: any) => sdk.put(`edit-sv-do-an-tot-nghiep/${item.id}`, item),

  listSinhVienGiaoVienPhanBien: (params?: any) => sdk.post(`list-sinh-vien-phan-bien`, params)
};
