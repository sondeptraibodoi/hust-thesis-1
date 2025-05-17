import { CallbackGetData } from "@/hooks/useAgGrid";
import { Paginate } from "@/interface/axios";
import { Loading } from "@/pages/Loading";
import { Empty, Pagination } from "antd";
import { PaginationProps } from "antd/lib";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

const BaseTableMobile: FC<{
  textNodata?: string;
  item: (item: any, key: number) => ReactNode;
  api: CallbackGetData;
  filter?: any;
}> = ({ textNodata = "Không có dữ liệu thỏa mãn", item, api, filter }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1
  });
  const [dataSource, setDataSource] = useState<any[]>([]);
  const onShowSizeChange: PaginationProps["onShowSizeChange"] = useCallback((current: number, pageSize: number) => {
    setPagination((state) => {
      return {
        ...state,
        itemsPerPage: pageSize,
        page: current
      };
    });
  }, []);
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await api(filter);
      setDataSource(res.data.list || []);
      setPagination((state) => {
        return {
          ...state,
          total: res.data.pagination.total,
          page: res.data.pagination.page,
          itemsPerPage: res.data.pagination.itemsPerPage
        };
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getData({
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      ...filter
    });
  }, [pagination.itemsPerPage, pagination.page, filter]);
  if (loading) {
    return <Loading></Loading>;
  }
  if (!dataSource || dataSource.length < 1)
    return (
      <div className="p-2 text-center">
        <Empty description={textNodata} />
      </div>
    );
  return (
    <>
      {dataSource.map((record, key) => (
        <div key={key}>{item(record, key)}</div>
      ))}
      <div className="flex justify-between items-center flex-grow-0 px-2">
        <Pagination
          current={pagination.page}
          pageSize={pagination.itemsPerPage}
          showSizeChanger
          onChange={onShowSizeChange}
          total={pagination.total}
        />
        <div className="px-2">Tổng số: {pagination.total || 0}</div>
      </div>
    </>
  );
};
export default BaseTableMobile;
