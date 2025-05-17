import giaoVienApi from "@/api/user/giaoVien.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useGiaoVienApi(params?: any) {
  const queryClient = useQueryClient();
  const { data: items } = useQuery({
    refetchOnMount: false,
    staleTime: Infinity,
    queryKey: ["giao-vien", params],
    queryFn: ({ queryKey }) => {
      const [_, params] = queryKey;
      return giaoVienApi.cache(params).then((res) => res.data);
    }
  });
  const getData = useCallback(async () => {
    let result = items || [];
    if (!result || result.length < 1) {
      result = await queryClient.fetchQuery({
        queryKey: ["giao-vien", params],
        queryFn: ({ queryKey }) => {
          const [_, params] = queryKey;
          return giaoVienApi.cache(params).then((res) => res.data);
        },
        staleTime: Infinity
      });
    }
    return result;
  }, [items]);
  return { items: items || [], getData };
}
