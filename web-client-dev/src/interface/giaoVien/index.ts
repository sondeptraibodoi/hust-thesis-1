import { User } from "../user";

export interface GiaoVien {
  id: number;
  name: string;
  email: string;
  user?: User;
}
