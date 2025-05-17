import { Spin } from "antd";
import { FC, HTMLAttributes } from "react";

export type BaseHandlerLoadingProps = HTMLAttributes<HTMLElement> & {
  loading?: boolean;
};
export const BaseHandlerLoading: FC<BaseHandlerLoadingProps> = ({ loading, children }) => {
  if (!loading) return children;
  return (
    <div className="flex justify-center items-center base-handler-loading h-full">
      <div className="flex flex-column gap-2">
        <Spin></Spin>
        <span>Đang tải dữ liệu...</span>
      </div>
    </div>
  );
};

export default BaseHandlerLoading;
