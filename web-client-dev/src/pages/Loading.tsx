import { Spin } from "antd";
export const PageLoading = () => {
  return (
    <div className="loading-container page-loading">
      <Spin />
    </div>
  );
};
export const Loading = () => {
  return (
    <div className="loading-container">
      <Spin />
    </div>
  );
};
