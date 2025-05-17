import Page404 from "@/pages/error/404";
import Page500 from "@/pages/error/500";
import { RefetchOptions, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FC, ReactNode } from "react";
import BaseHandlerLoading from "./base-handler-loading";

export type BaseHandlerGetDetailProps = {
  children: (data: any, reftech: (options?: RefetchOptions) => Promise<any>) => ReactNode;
  option: any;
};

export const BaseHandlerGetDetail: FC<BaseHandlerGetDetailProps> = ({ children, option }) => {
  const { data, isLoading, error, refetch } = useQuery(option);
  if (isLoading) {
    return <BaseHandlerLoading loading={isLoading}></BaseHandlerLoading>;
  }
  if (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response?.status === 404) {
        return <Page404 />;
      }
    }
    return <Page500 />;
  }
  if (!data) {
    return;
  }
  return children(data, refetch);
};

export default BaseHandlerGetDetail;
