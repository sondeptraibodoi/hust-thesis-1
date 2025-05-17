import { AxiosResponse } from "axios";
import { convertLinkToBackEnd } from "@/utils/url";
import { getPrefix } from "@/constant";
import { sdk } from "./axios";

export async function downloadFromApiReturnKey(api: () => Promise<AxiosResponse<DownloadReturn>>) {
  const res = await api();

  const data = res.data;
  if (data.data) {
    window.open(convertLinkToBackEnd(getPrefix() + `/api/download/data/${data.data}`), "_self");
  }
  return res;
}
type ExportExcel = {
  name: string;
  title: string;
  headers: { value: string; text: string }[];
  data: any[];
  simple?: boolean;
};
type DownloadReturn = {
  data: string;
};
export default {
  downloadExcel: (data: ExportExcel) =>
    downloadFromApiReturnKey(() =>
      sdk.request<DownloadReturn>({
        method: "post",
        url: `download/excel`,
        data
      })
    )
};
