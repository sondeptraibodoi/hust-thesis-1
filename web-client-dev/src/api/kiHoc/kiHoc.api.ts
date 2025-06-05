import { sdk } from "../axios";
import storage from "../../plugin/storage";
export default {
  // list: () =>
  //   storage.handleGetDataStorage("ki-hoc", () => sdk.get<string[]>("ki-hocs").then((res) => ({ data: res.data }))),
  cache: () =>
    storage.handleGetDataStorage("cache-ki-hoc", () =>
      sdk.get<string[]>("cache/ki-hoc").then((res) => ({ data: res.data }))
    )
};
