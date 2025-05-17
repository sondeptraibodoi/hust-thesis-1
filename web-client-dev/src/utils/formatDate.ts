import { format } from "date-fns";

export function formatDate(date: any) {
  const res = !date ? "" : typeof date === "string" ? format(new Date(date), "dd/MM/yyyy") : date.format("dd/MM/yyyy");
  return res;
}
