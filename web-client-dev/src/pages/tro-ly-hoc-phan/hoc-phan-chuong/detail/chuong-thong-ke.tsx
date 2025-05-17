import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Loading } from "@/pages/Loading";
import { useQuery } from "@tanstack/react-query";
import { Button, Descriptions, DescriptionsProps, Typography } from "antd";
import { FC } from "react";

const { Text } = Typography;
const ThongKeSide: FC<{
  chuong: HocPhanChuong;
}> = ({ chuong }) => {
  const { data, refetch, isFetching } = useQuery({
    refetchOnMount: false,
    queryKey: ["tro-ly-chuong", chuong.id, "thong-ke"],
    queryFn: ({ queryKey }) => {
      const [, chuongId] = queryKey;
      return hocPhanChuongApi.showChuongThongKe(chuongId).then((res) => res.data);
    }
  });
  if (isFetching) {
    return (
      <div className="">
        <Loading />
      </div>
    );
  }
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Số câu hỏi",
      children: <FormatCount count={data?.count_cau_hoi} required={0} />
    },
    {
      key: "1",
      label: "Số câu hỏi đang sử dụng",
      children: <FormatCount count={data?.count_cau_hoi_dang_su_dung} required={chuong.so_cau_hoi} />
    },
    {
      key: "2",
      label: "Số câu hỏi cho thi thử",
      children: <FormatCount count={data?.count_cau_hoi_thi_thu} required={chuong.so_cau_hoi} />
    },
    {
      key: "3",
      label: "Số câu hỏi cho thi thật",
      children: <FormatCount count={data?.count_cau_hoi_thi_that} required={chuong.so_cau_hoi} />
    }
  ];
  return (
    <div className="">
      <Descriptions title="Câu hỏi" items={items} extra={<Button onClick={() => refetch()}>Tải lại</Button>} />
    </div>
  );
};
export default ThongKeSide;

const FormatCount: FC<{ count: number; required: number }> = ({ count, required }) => {
  if (!count) {
    return <Text type="danger">0</Text>;
  }
  if (required > 0 && count < required) {
    return <Text type="danger">{count}</Text>;
  }
  return count;
};
