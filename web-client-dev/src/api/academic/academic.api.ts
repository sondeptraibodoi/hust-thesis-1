import { AxiosResponse } from "axios";
import { ApiListReturn } from "@/interface/axios";
import { CallbackParams } from "@/hooks/useAgGrid";
import { sdk } from "../axios";

const tableParams = (params?: CallbackParams | any) => ({
  ...params,
  per_page: params?.itemsPerPage,
});

const toTableResponse = <T = any>(res: AxiosResponse<any>): AxiosResponse<ApiListReturn<T>> => {
  const payload = res.data?.data ?? res.data;
  const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.list ?? [];
  const total = payload?.total ?? rows.length;
  const perPage = payload?.per_page ?? payload?.itemsPerPage ?? rows.length ?? 10;
  const currentPage = payload?.current_page ?? payload?.page ?? 1;
  const lastPage = payload?.last_page ?? payload?.totalPage ?? 1;

  return {
    ...res,
    data: {
      list: rows,
      pagination: {
        count: rows.length,
        hasMoreItems: currentPage < lastPage,
        itemsPerPage: perPage,
        page: currentPage,
        total,
        totalPage: lastPage,
      },
    },
  };
};

const tableGet = async <T = any>(url: string, params?: CallbackParams | any) => {
  const res = await sdk.get(url, { params: tableParams(params) });
  return toTableResponse<T>(res);
};

export default {
  hocKy: {
    list: (params?: CallbackParams | any) => tableGet("academic/hoc-ky", params),
    create: (item: any) => sdk.post("academic/hoc-ky", item),
    edit: (item: any) => sdk.put(`academic/hoc-ky/${item.id}`, item),
    delete: (item: any) => sdk.delete(`academic/hoc-ky/${item.id}`),
  },
  cauHinh: {
    list: (params?: CallbackParams | any) => tableGet("academic/cau-hinh", params),
    upsert: (item: any) => sdk.post("academic/cau-hinh", item),
  },
  lopHocPhan: {
    list: (params?: CallbackParams | any) => tableGet("academic/lop-hoc-phan", params),
    create: (item: any) => sdk.post("academic/lop-hoc-phan", item),
    edit: (item: any) => sdk.put(`academic/lop-hoc-phan/${item.id}`, item),
    delete: (item: any) => sdk.delete(`academic/lop-hoc-phan/${item.id}`),
  },
  lopHanhChinh: {
    list: (params?: CallbackParams | any) => tableGet("academic/lop-hanh-chinh", params),
    create: (item: any) => sdk.post("academic/lop-hanh-chinh", item),
    edit: (item: any) => sdk.put(`academic/lop-hanh-chinh/${item.id}`, item),
    delete: (item: any) => sdk.delete(`academic/lop-hanh-chinh/${item.id}`),
  },
  dangKy: {
    list: (params?: CallbackParams | any) => tableGet("academic/dang-ky-mon-hoc", params),
    create: (item: any) => sdk.post("academic/dang-ky-mon-hoc", item),
    cancel: (item: any) => sdk.put(`academic/dang-ky-mon-hoc/${item.id}/huy`, item),
  },
  sinhVien: {
    list: (params?: CallbackParams | any) => tableGet("sinh-vien", params),
  },
  bangDiem: {
    list: (params?: CallbackParams | any) => tableGet("academic/bang-diem", params),
    edit: (item: any) => sdk.put(`academic/bang-diem/${item.id}`, item),
    chot: (item: any) => sdk.put(`academic/bang-diem/${item.id}/chot`, item),
  },
  phucKhao: {
    list: (params?: CallbackParams | any) => tableGet("academic/phuc-khao", params),
    create: (item: any) => sdk.post("academic/phuc-khao", item),
    resolve: (item: any) => sdk.put(`academic/phuc-khao/${item.id}/xu-ly`, item),
  },
  chuNhiem: {
    sinhVien: (params?: CallbackParams | any) => tableGet("academic/chu-nhiem/sinh-vien", params),
    tongQuanSinhVien: (id: string | number) => sdk.get(`academic/chu-nhiem/sinh-vien/${id}`),
    assignSinhVien: (lopId: string | number, sinhVienIds: Array<string | number>) =>
      sdk.post(`academic/chu-nhiem/lop/${lopId}/sinh-vien`, { sinh_vien_ids: sinhVienIds }),
    createSinhVien: (lopId: string | number, item: any) =>
      sdk.post(`academic/chu-nhiem/lop/${lopId}/sinh-vien/create`, item),
    removeSinhVien: (lopId: string | number, sinhVienId: string | number) =>
      sdk.delete(`academic/chu-nhiem/lop/${lopId}/sinh-vien/${sinhVienId}`),
  },
};
