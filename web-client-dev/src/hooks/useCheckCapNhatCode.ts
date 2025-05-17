import { systemApi } from "@/api/admin/system.api";
import { useQuery } from "@tanstack/react-query";
import { App } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
const lastReload = dayjs();
const queryKey = ["app", "cap-nhap-chuong-trinh"];
export function useCheckCapNhatCode() {
  const { notification: api } = App.useApp();
  const openNotification = (description: string) => {
    api.destroy(`notification-check-cap-nhat`);
    api.warning({
      key: `notification-check-cap-nhat`,
      message: `Cập nhật hệ thống`,
      description: description,
      placement: "topLeft",
      closeIcon: false,
      duration: 0
    });
  };
  const { data } = useQuery({
    refetchOnWindowFocus: true,
    enabled: import.meta.env.MODE !== "development",
    refetchInterval: 1000 * 60 * 60, //1 hour,
    staleTime: 1000 * 60 * 10, //10 min
    queryKey,
    queryFn: () => {
      return systemApi.checkUpdate();
    }
  });
  // useEffect(() => {
  //   const update = () => {
  //     refetch();
  //   };
  //   subscribe("system", "upgrade", update);
  //   return () => {
  //     unsubscribe("system", "upgrade", update);
  //   };
  // }, []);
  useEffect(() => {
    if (!data || !data.data) {
      return;
    }
    if (data.data.description) {
      if (data.data.time_update_done) {
        const time_update_done = dayjs(data.data.time_update_done);
        const is_reload_after_updated = lastReload.isAfter(time_update_done);
        if (is_reload_after_updated) {
          return;
        }
      }
      openNotification(data.data.description);
    }
  }, [data]);
}
