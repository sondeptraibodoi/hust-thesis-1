import { Lop } from "@/interface/lop";
import { Button, Card, Divider, Input, List, Tag, Typography } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import taiLieuSinhVienLopApi from "@/api/taiLieu/taiLieuSinhVienLop.api";
import { TaiLieuChung } from "@/interface/tai-lieu";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;
const ListTaiLieuLopSVPage: FC<{ lop: Lop }> = ({ lop }) => {
  const queryClient = useQueryClient();
  const [dataSource, setDataSource] = useState<TaiLieuChung[]>([]);
  const { Search } = Input;
  const [orderBy, setOrderBy] = useState(true);
  const [orderByType, setOrderByType] = useState("ten");
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    if (!isSorted) {
      handleOrderBy(orderByType);
      setIsSorted(true);
    }
  }, [isSorted]);

  const getData = useCallback(async () => {
    let items: TaiLieuChung[] = [];
    try {
      const res = await await queryClient.fetchQuery({
        queryKey: ["lop", lop.id, "tai-lieu"],
        queryFn: ({ queryKey }) => {
          const [_, lop_id] = queryKey;
          return taiLieuSinhVienLopApi.lopTaiLieu(lop_id);
        },
        staleTime: Infinity
      });

      items = res.data;
      items.sort((a, b) => a.ten.localeCompare(b.ten));
      setDataSource(items);
    } finally {
      <></>;
    }
  }, [lop]);

  useEffect(() => {
    getData();
    handleOrderBy("ten");
  }, []);

  const handleSearch = (value: string) => {
    if (value.trim() === "") {
      getData();
    } else {
      const filteredData = dataSource.filter((item) => item.ten.toLowerCase().includes(value.toLowerCase()));
      setDataSource(filteredData);
    }
  };

  const handleOrderBy = (value: string) => {
    if (orderBy) {
      if (value === "ten") {
        setOrderByType("ten");
        setDataSource([...dataSource].sort((a, b) => a.ten.localeCompare(b.ten)));
      } else if (value === "created_at") {
        setOrderByType("created_at");
        setDataSource(
          [...dataSource].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        );
      } else if (value === "loai_tai_lieu_id") {
        setOrderByType("loai_tai_lieu_id");
        setDataSource(
          [...dataSource].sort((a, b) => {
            if (typeof a.loai_tai_lieu_id === "string" && typeof b.loai_tai_lieu_id === "string") {
              return a.loai_tai_lieu_id.localeCompare(b.loai_tai_lieu_id);
            } else {
              return a.loai_tai_lieu_id - b.loai_tai_lieu_id;
            }
          })
        );
      }
    } else {
      if (value === "ten") {
        setOrderByType("ten");
        setDataSource([...dataSource].sort((a, b) => b.ten.localeCompare(a.ten)));
      } else if (value === "created_at") {
        setOrderByType("created_at");
        setDataSource(
          [...dataSource].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
      } else if (value === "loai_tai_lieu_id") {
        setOrderByType("loai_tai_lieu_id");
        setDataSource(
          [...dataSource].sort((a, b) => {
            if (typeof a.loai_tai_lieu_id === "string" && typeof b.loai_tai_lieu_id === "string") {
              return b.loai_tai_lieu_id.localeCompare(a.loai_tai_lieu_id);
            } else {
              return b.loai_tai_lieu_id - a.loai_tai_lieu_id;
            }
          })
        );
      }
    }
  };

  const handleSetOrderBy = () => {
    setOrderBy(!orderBy);
    setIsSorted(false);
    // handleOrderBy(orderByType);
  };

  const isMobile = useMediaQuery({ minWidth: 600 });

  return (
    <>
      {isMobile ? (
        <>
          <div className="d-flex items-center justify-between">
            <Typography.Title level={3}>Danh sách tài liệu</Typography.Title>
          </div>
          <div className="flex flex-wrap items-center justify-between mt-2 gap-2 mb-4">
            <div className="flex justify-start flex-wrap gap-2 ">
              <Search
                placeholder="Tìm tài liệu"
                onSearch={handleSearch}
                enterButton
                style={{ width: 350 }}
                allowClear
              />
            </div>
            <div className="flex items-baseline">
              <h3 className="mr-2">
                <strong>Sắp xếp theo:</strong>
              </h3>
              <Button type={orderByType === "ten" ? "dashed" : "text"} onClick={() => handleOrderBy("ten")}>
                Tên tài liệu
              </Button>
              <Button
                type={orderByType === "loai_tai_lieu_id" ? "dashed" : "text"}
                onClick={() => handleOrderBy("loai_tai_lieu_id")}
              >
                Loại tài liệu
              </Button>
              <Button
                type={orderByType === "created_at" ? "dashed" : "text"}
                onClick={() => handleOrderBy("created_at")}
              >
                Ngày tạo
              </Button>
              {orderBy ? (
                <Button type="text" onClick={handleSetOrderBy}>
                  <ArrowUpOutlined />
                </Button>
              ) : (
                <Button type="text" onClick={handleSetOrderBy}>
                  <ArrowDownOutlined />
                </Button>
              )}
            </div>
          </div>
          <div
            id="scrollableDiv"
            style={{
              height: 400,
              overflow: "auto",
              padding: "0 16px",
              border: "1px solid rgba(140, 140, 140, 0.35)",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px"
            }}
          >
            <InfiniteScroll
              dataLength={dataSource.length}
              next={getData}
              hasMore={dataSource.length < 50}
              loader={""}
              endMessage={<Divider plain>Hiện tại chưa có tài liệu mới</Divider>}
              scrollableTarget="scrollableDiv"
            >
              <List
                dataSource={dataSource}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      style={{
                        borderBlockEnd: "1px solid #c0c0c0",
                        paddingBottom: "10px"
                      }}
                      title={
                        <>
                          <Tag color="#C02135">{item.loai_tai_lieu.loai}</Tag>
                          <a
                            href={item.link}
                            style={{
                              color: "#C02135",
                              textDecoration: "underline"
                            }}
                            target="blank"
                          >
                            {item.ten}
                          </a>
                        </>
                      }
                      description={
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word"
                          }}
                        >
                          {item.mo_ta}
                        </pre>
                      }
                    />
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          </div>
        </>
      ) : (
        <>
          <div className="d-flex items-center justify-between">
            <Title level={3}>Danh sách tài liệu</Title>
          </div>
          <div className="flex flex-wrap items-center justify-between mt-2 gap-2 mb-4">
            <div className="flex justify-start flex-wrap gap-2 ">
              <Search
                placeholder="Tìm tài liệu"
                onSearch={handleSearch}
                enterButton
                style={{ width: 350 }}
                allowClear
              />
            </div>
            <div className="flex items-baseline">
              <h3 className="mr-2">
                <strong>Sắp xếp theo:</strong>
              </h3>
              <Button type="text" onClick={() => handleOrderBy("ten")}>
                Tên tài liệu
              </Button>
              <Button type="text" onClick={() => handleOrderBy("loai_tai_lieu_id")}>
                Loại tài liệu
              </Button>
              <Button type="text" onClick={() => handleOrderBy("created_at")}>
                Ngày tạo
              </Button>
              {orderBy ? (
                <Button type="text" onClick={() => setOrderBy(false)}>
                  <ArrowUpOutlined />
                </Button>
              ) : (
                <Button type="text" onClick={() => setOrderBy(true)}>
                  <ArrowDownOutlined />
                </Button>
              )}
            </div>
          </div>
          <div className="card-container card-diem-danh">
            {dataSource.map((record: TaiLieuChung) => (
              <Card
                key={record.id}
                title={<strong className="card-diem-danh__title">{record.loai_tai_lieu.loai}</strong>}
              >
                <p>
                  <span>
                    <a
                      href={record.link}
                      style={{
                        color: "#0B4C8C",
                        textDecoration: "underline"
                      }}
                    >
                      {record.ten}
                    </a>
                  </span>
                </p>
                <p>
                  <strong>Mô tả: </strong>
                  {record.mo_ta}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ListTaiLieuLopSVPage;
