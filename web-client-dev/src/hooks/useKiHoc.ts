import kiHocApi from "@/api/kiHoc/kiHoc.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const queryKey = ["ki-hoc"];
const queryFn = () => {
  return kiHocApi.list().then((res) => res.data);
};
export function useKiHoc() {
  const queryClient = useQueryClient();
  const { data: items } = useQuery({
    refetchOnMount: false,
    staleTime: Infinity,
    queryKey,
    queryFn
  });
  const getData = useCallback(async () => {
    let result = items || [];
    if (!result || result.length < 1) {
      result = await queryClient.fetchQuery({
        queryKey,
        queryFn,
        staleTime: Infinity
      });
    }
    return result.map((x) => ({ value: x, label: x }));
  }, [items]);
  return { items: items || [], getData };
}
