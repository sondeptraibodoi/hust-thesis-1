import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";
import { IBangDiem } from "@/interface/bangdiem";
import { LopThi } from "@/interface/lop";
import { FieldId } from "@/interface/common";

export default {
  list: (params: CallbackParams) => sdk.post(`bang-diem-list`, params),

  create: (data: any) =>
    sdk.post(`bang-diem/add`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  createExcel: (data: any) =>
    sdk.post(`bang-diem/add/excel`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  update: (data: IBangDiem) =>
    sdk.post(`bang-diem/update/${data.id}`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  updateExcel: (data: IBangDiem) =>
    sdk.post(`bang-diem/update/${data.id}/excel`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  delete: (data: any) => sdk.put(`bang-diem/delete/${data.id}`, data),
  slicePdf: (data: any) => sdk.post(`bang-diem/slice-pdf/${data.id}`, data),
  show: (id: number | string | undefined) => sdk.get<IBangDiem>("bang-diem/show/" + id),
  congBo: (data: IBangDiem) => sdk.post(`bang-diem/cong-bo-diem/${data.id}`, data),
  layTrangChuaNhanDien: (id?: string | number) => sdk.get<string[]>(`bang-diem/${id}/chua-nhan-dien`),
  getThongTin: (id?: string | number) =>
    sdk.get<{
      trang_chua_nhan_dien: string[];
      so_lop_hoan_thanh: number;
      so_lop_chua_hoan_thanh: number;
    }>(`bang-diem/${id}/thong-tin`),
  nhanDien: (data: any, id: any) => sdk.put(`bang-diem/${id}/nhan_diens`, data),
  deleteLopThi: (bang_diem_id: FieldId, lop_thi_id: FieldId) =>
    sdk.delete(`bang-diem/${bang_diem_id}/nhan_diens/${lop_thi_id}`),
  getLopthiThuocBangdiem: (id: number | string) => sdk.get<LopThi[]>(`bang-diem/${id}/lop-this`),
  nhandienDiem: (data: any) => sdk.get(`bang-diem/${data.id}/nhan-dien`, { params: data }),
  lopThiGiaoVien: (id: number) => sdk.get(`lop-thi-giao-vien/${id}`),
  updatePdfLopThi: (params: any) =>
    sdk.post(`bang-diem/sua-file-lop-thi/${params.id}`, params, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};
