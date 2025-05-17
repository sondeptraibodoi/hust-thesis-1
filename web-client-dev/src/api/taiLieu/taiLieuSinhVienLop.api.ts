import { sdk } from "../axios";

export default {
  lopTaiLieu: (id: any) => sdk.get(`student-lop-list/${id}/tai-lieus`)
};
