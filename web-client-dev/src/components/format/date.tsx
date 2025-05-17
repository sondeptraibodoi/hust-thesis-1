import dayjs from "dayjs";
import { FC } from "react";

export const DateFormat: FC<{ value?: string; defaultValue?: string }> = ({ value, defaultValue }) => {
  if (!value) {
    return <span>{defaultValue}</span>;
  }

  const formatDate = dayjs(value).format("DD/MM/YYYY");
  return <span>{formatDate}</span>;
};
