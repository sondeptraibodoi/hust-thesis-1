import { FieldId } from "@/interface/common";
import lopHocApi from "@/api/lop/lopHoc.api";
import { queryOptions } from "@tanstack/react-query";

export const queryLopHocApi = (lop_id: FieldId) =>
  queryOptions({
    queryKey: ["lop", lop_id, "sinh-vien"] as const,
    queryFn: ({ queryKey }) => {
      const [_, lop_id] = queryKey;
      return lopHocApi.listSinhVien(lop_id);
    },
    staleTime: Infinity
  });

export const queryLopHocWithDiemApi = (lop_id: FieldId) =>
  queryOptions({
    queryKey: ["lop", lop_id, "diem-sinh-vien"] as const,
    queryFn: ({ queryKey }) => {
      const [_, lop_id] = queryKey;
      return lopHocApi.listSinhVienWithDiem(lop_id);
    },
    staleTime: Infinity
  });
