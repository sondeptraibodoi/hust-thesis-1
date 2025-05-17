import { sdk } from "../axios";

export default {
  detail: (data: any) => sdk.get(`lop-thi-diem/${data.id}`, data),
  list: (data: any) => sdk.post(`diem-lop-thi-list/${data.id}`, data),
  lopThiNhanDien: (data: any) => sdk.get(`lop-thi-nhan-dien/${data.id}`, data),
  nhanDienList: (data: any) => sdk.post(`diem-nhan-dien-list/${data.id}`, data),
  save: (data: any) => sdk.post(`diem-lop-thi/save/${data.id}`, data),
  luuDiemChuyenNganh: (id: any, data: any) => sdk.post(`diem-lop-thi/${id}/save-chuyen-nganh`, data)
};
