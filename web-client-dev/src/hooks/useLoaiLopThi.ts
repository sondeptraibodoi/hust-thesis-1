import lopThiApi from "@/api/lop/lopThi.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
const queryKey = ["loai-lop-thi"];
const queryFn = () => {
  return lopThiApi.listLoaiThi().then((res) => res.data);
};
export function useLoaiLopThi() {
  const queryClient = useQueryClient();
  const { data: items } = useQuery({
    refetchOnMount: false,
    staleTime: Infinity,
    queryKey,
    queryFn
  });
  const items_cache = useMemo(
    () =>
      (items || []).reduce<{ [key: string]: string }>((acc, x) => {
        acc[x.value] = x.title;
        return acc;
      }, {}),
    [items]
  );
  const format = useCallback(
    function (value: string) {
      return items_cache[value] || "";
    },
    [items_cache]
  );
  const getData = useCallback(async () => {
    let result = items || [];
    if (!result || result.length < 1) {
      result = await queryClient.fetchQuery({
        queryKey,
        queryFn,
        staleTime: Infinity
      });
    }
    return result.map((x) => ({
      label: x.title,
      value: x.value
    }));
  }, [items]);
  return { items: items || [], format, getData };
}
