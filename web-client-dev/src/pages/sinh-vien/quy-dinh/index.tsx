import loaiTaiLieuApi from "@/api/taiLieu/loaiTaiLieu.api";
import taiLieuChungApi from "@/api/taiLieu/taiLieuChung.api";
import { Paginate } from "@/interface/axios";
import { LoaiTaiLieu, TaiLieuChung } from "@/interface/tai-lieu";
import PageContainer from "@/Layout/PageContainer";
import { ArrowDownOutlined, ArrowUpOutlined, InboxOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Input, List, Row, Select, Spin, Tag } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const { Search } = Input;

const QuyDinhPage: FC<any> = () => {
  const [dataSource, setDataSource] = useState<TaiLieuChung[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | null>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [listNhomChung, setListNhomChung] = useState<LoaiTaiLieu[]>([]);
  const [loai, setLoai] = useState<string>();
  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1
  });

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await taiLieuChungApi.quyDinh(filter);
      if (res.data.list) {
        setDataSource(res.data.list);
        setPagination((state) => ({
          ...state,
          total: res.data.pagination.total,
          hasMoreItems: res.data.list.length >= state.itemsPerPage
        }));
      } else {
        setPagination((state) => ({
          ...state,
          hasMoreItems: false
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getLoaiTlNhomChung = async () => {
      const payload: any = {
        nhom: "Tài liệu chung"
      };
      try {
        const res = await loaiTaiLieuApi.list(payload);
        res.data.length > 0 && setListNhomChung(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getLoaiTlNhomChung();
  }, []);

  useEffect(() => {
    const sendData: any = {
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1,
      trang_thai: "1-Đang sử dụng",
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: search
    };
    if (loai) {
      sendData.loai_tai_lieu_id = loai;
    }
    getData(sendData);
  }, [pagination.page, sortBy, sortOrder, search, getData, loai]);

  const fetchMoreData = () => {
    setPagination((state) => ({
      ...state,
      page: state.page + 1
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearchSubmit = () => {
    setSearch(searchValue);
    setPagination((state) => ({
      ...state,
      page: 1
    }));
    setDataSource([]);
  };

  const handleSortChange = (sortType: string) => {
    if (sortBy === sortType) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortType);
      setSortOrder("asc");
    }
    setPagination((state) => ({
      ...state,
      page: 1
    }));
    setDataSource([]);
  };

  const renderSortIcon = () => {
    return sortOrder === "asc" ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  return (
    <PageContainer title="Danh sách thông báo ">
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Search
            placeholder="Tìm tài liệu"
            allowClear
            onChange={(e: any) => handleSearchChange(e.target.value)}
            value={searchValue}
            onPressEnter={handleSearchSubmit}
            style={{ width: 300, marginRight: "12px", marginBottom: "12px" }}
            enterButton={<Button type="primary" onClick={handleSearchSubmit} icon={<SearchOutlined />} />}
          />
          <Select
            style={{ minWidth: 300 }}
            showSearch
            allowClear
            placeholder="Chọn loại tài liệu"
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={listNhomChung?.map((item: LoaiTaiLieu) => {
              return {
                value: item.id,
                label: item.loai
              };
            })}
            onChange={(value) => {
              setLoai(value);
            }}
          />
        </Col>
        <Col>
          <Row gutter={16} align="middle">
            <Col>
              <strong>Sắp xếp theo:</strong>
            </Col>
            <Col>
              <Button
                type={sortBy === "ten" ? "dashed" : "text"}
                onClick={() => handleSortChange("ten")}
                style={{ width: 120 }}
              >
                Tên tài liệu
              </Button>
              <Button
                type={sortBy === "loai_tai_lieu_id" ? "dashed" : "text"}
                onClick={() => handleSortChange("loai_tai_lieu_id")}
                style={{ width: 100 }}
              >
                Loại tài liệu
              </Button>
              <Button
                type={sortBy === "created_at" ? "dashed" : "text"}
                onClick={() => handleSortChange("created_at")}
                style={{ width: 100 }}
              >
                Ngày tạo
              </Button>
              <Button type="text" onClick={() => handleSortChange(sortBy || "created_at")}>
                {renderSortIcon()}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center my-4">
          <Spin size="large" />
          <p>Đang tải tài liệu...</p>
        </div>
      ) : dataSource.length === 0 ? (
        <div className="text-center my-4">
          <Empty
            image={<InboxOutlined style={{ fontSize: 120, color: "#ccc" }} />}
            description={<span>Tài liệu trống</span>}
          />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={dataSource.length}
          next={fetchMoreData}
          hasMore={pagination.hasMoreItems}
          loader={
            <div className="text-center my-4">
              <Spin size="large" />
              <p>Đang tải thêm tài liệu...</p>
            </div>
          }
          endMessage={
            dataSource.length > 13 && (
              <div className="text-center my-4">
                <p>Hiện tại chưa có tài liệu mới.</p>
              </div>
            )
          }
        >
          <List
            dataSource={dataSource}
            renderItem={(document: TaiLieuChung, index: number) => (
              <List.Item key={index}>
                <List.Item.Meta
                  style={{
                    borderBlockEnd: "1px solid #c0c0c0",
                    paddingBottom: "10px"
                  }}
                  title={
                    <>
                      <Tag color="#C02135">{document.loai_tai_lieu.loai}</Tag>
                      <a
                        href={document.link}
                        style={{
                          color: "#C02135",
                          textDecoration: "underline"
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {document.ten}
                      </a>
                    </>
                  }
                  description={<pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{document.mo_ta}</pre>}
                />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      )}
    </PageContainer>
  );
};

export default QuyDinhPage;
