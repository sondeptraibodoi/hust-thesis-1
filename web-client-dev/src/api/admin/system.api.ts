import { sdk } from "../axios";

export const systemApi = {
  checkUpdate: () =>
    sdk.get<{ time_update: string; time_update_end: string; description: string; time_update_done: string }>(
      "system/check-update"
    ),
  chart: (params: any) => sdk.post('tong-hop-diem', params)
};
