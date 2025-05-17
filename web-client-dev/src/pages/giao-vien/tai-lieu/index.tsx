import BaseTable from "@/components/base-table";
import { DeleteOutlined, EditOutlined, RightOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";

import BaseResponsive from "@/components/base-responsive";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Switch, Tag, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
// import taiLieuChungApi from "@/api/taiLieu/taiLieuChung.api";
import taiLieuGiaoVienApi from "@/api/taiLieu/taiLieuGiaoVien.api";

import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { TaiLieuChung } from "@/interface/tai-lieu";
import EditorDialog from "./editor-dialog";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const isTrangThai = [
  {
    value: "1-Đang sử dụng",
    label: "Đang sử dụng"
  },
  {
    value: "2-Dừng sử dụng",
    label: "Dừng sử dụng"
  }
];

// const isPhamVi = [
//   { value: "1-Chung", label: "1-Chung" },
//   { value: "2-Riêng", label: "2-Riêng" }
// ];

const TaiLieuPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <TaiLieuPageDesktop />;
  const contentMobile = () => <TaiLieuPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default TaiLieuPage;

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
      <Tooltip title="Chi tiết">
        <a href={"" + data.link} target="_blank">
          <Button shape="circle" icon={<RightOutlined />} type="text" />
        </a>
      </Tooltip>
    </>
  );
};

const StatusCellRender: FC<any> = ({ data }) => {
  switch (data?.trang_thai) {
    case "1-Đang sử dụng":
      return <Switch checked={true} />;
    case "2-Dừng sử dụng":
      return <Switch checked={false} />;
    default:
      return <></>;
  }
};
const LopCellRellDer: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      {data.lops.map((item: any, index: number) => (
        <Tag key={index}>{item.ma}</Tag>
      ))}
    </>
  );
};

const TaiLieuPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("tai-lieu-chung");
  const [data, setData] = useState<TaiLieuChung>();
  const [columnDefs] = useState<ColDef<TaiLieuChung & ActionField>[]>([
    {
      headerName: t("field.ma"),
      field: "ma",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ten"),
      field: "ten",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.loai_tai_lieu_id"),
      field: "loai_tai_lieu.ma",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.loai_tai_lieu"),
      field: "loai_tai_lieu.loai",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_lop"),
      field: "lops.ma",
      filter: "agTextColumnFilter",
      cellRenderer: LopCellRellDer
    },
    {
      headerName: t("field.mo_ta"),
      field: "mo_ta",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.link"),
      field: "link",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai",
      cellRenderer: StatusCellRender,
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        data: isTrangThai
      }
    },
    {
      headerName: t("field.created_by_id"),
      field: "created_by.username",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 200,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: TaiLieuChung) => {
          setData(item);
          setIsEdit(true);
          setIsModalEdit(true);
        },
        onDeleteItem: (item: TaiLieuChung) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false
    }
  ]);

  return (
    <>
      <PageContainer
        title="Quản lý tài liệu"
        extraTitle={
          <Space
            style={{
              float: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "end"
            }}
          >
            <Button onClick={() => setIsModalEdit(true)} type="primary">
              {t("action.create_new")}
            </Button>
          </Space>
        }
        descTitle={
          <Space
            style={{
              float: "left"
            }}
          >
            <p style={{ color: "#CF1627", fontSize: "17px" }}>
              Các tài liệu này sẽ được sinh viên tham gia học phần đó nhìn thấy ở <strong>Chi tiết lớp học</strong>
            </p>
          </Space>
        }
      >
        <BaseTable
          key={keyRender}
          columns={columnDefs}
          api={taiLieuGiaoVienApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <EditorDialog
        isEdit={isEdit}
        setEdit={setIsEdit}
        data={data}
        showModal={isModalEdit}
        setShowModal={setIsModalEdit}
        setKeyRender={setKeyRender}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="tai-lieu-chung"
        closeModal={setIsModalDelete}
        name={data?.ma}
        apiDelete={() => data && taiLieuGiaoVienApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

const TaiLieuPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<TaiLieuChung[]>([]);
  const [data, setData] = useState<TaiLieuChung>();
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { t } = useTranslation("tai-lieu-chung");

  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  };
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
      const res = await taiLieuGiaoVienApi.list(filter);
      if (res.data.list.length > 0) {
        setDataSource(res.data.list);
        setPagination((state) => {
          return {
            ...state,
            total: res.data.pagination.total
          };
        });
      } else {
        setDataSource([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = useCallback((current: number, pageSize: number) => {
    setPagination((state) => {
      return {
        ...state,
        itemsPerPage: pageSize,
        page: current
      };
    });
  }, []);
  const handleFieldChanged = (field: string, value: any) => {
    form.setFieldsValue({ [field]: value });
    onSubmit(form.getFieldsValue());
  };
  const onSubmit = (filter?: any) => {
    const sendData: any = {
      filterModel: {},
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ma) {
      sendData.filterModel.ma = {
        filterType: "text",
        type: "contains",
        filter: filter.ma
      };
    }
    if (filter.ten) {
      sendData.filterModel.ten = {
        filterType: "text",
        type: "contains",
        filter: filter.ten
      };
    }
    if (filter.loai_tai_lieu_id) {
      sendData.filterModel["loai_tai_lieu.ma"] = {
        filterType: "text",
        type: "contains",
        filter: filter.loai_tai_lieu_id
      };
    }
    if (filter.loai_tai_lieu) {
      sendData.filterModel["loai_tai_lieu.loai"] = {
        filterType: "text",
        type: "contains",
        filter: filter.loai_tai_lieu
      };
    }
    if (filter.pham_vi) {
      sendData.filterModel.pham_vi = {
        filterType: "text",
        type: "contains",
        filter: filter.pham_vi
      };
    }
    if (filter.mo_ta) {
      sendData.filterModel.mo_ta = {
        filterType: "text",
        type: "contains",
        filter: filter.mo_ta
      };
    }
    if (filter.link) {
      sendData.filterModel.link = {
        filterType: "text",
        type: "contains",
        filter: filter.link
      };
    }
    if (filter.trang_thai) {
      sendData.filterModel.trang_thai = {
        filterType: "text",
        type: "contains",
        filter: filter.trang_thai
      };
    }
    if (filter.created_by_id) {
      sendData.filterModel["created_by.username"] = {
        filterType: "text",
        type: "contains",
        filter: filter.created_by_id
      };
    }

    getData(sendData);
  };

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form
      form={form}
      layout="vertical"
      {...layout}
      labelWrap
      onFinish={onSubmit}
      initialValues={{
        trang_thai: "1-Đang sử dụng"
      }}
    >
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã tài liệu">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("ma", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten" label="Tên tài liệu">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("ten", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="loai_tai_lieu_id"
            label="Mã loại tài liệu"
          >
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("loai_tai_lieu_id", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="loai_tai_lieu" label="Loại tài liệu">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("loai_tai_lieu", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        {/* <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="pham_vi"
            label="Phạm vi áp dụng"
          >
            <Select
              allowClear
              onChange={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("pham_vi", e);
                }
              }}
              options={[
                { value: "1-Chung", label: "1-Chung" },
                { value: "2-Riêng", label: "2-Riêng" }
              ]}
            />
          </Form.Item>
        </Col> */}
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="mo_ta" label="Mô tả">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("mo_ta", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="link" label="Link tài liệu">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("link", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="trang_thai" label="Trạng thái">
            <Select
              allowClear
              onChange={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("trang_thai", e);
                }
              }}
              options={[
                {
                  value: "1-Đang sử dụng",
                  label: "Đang sử dụng"
                },
                {
                  value: "2-Dừng sử dụng",
                  label: "Dừng sử dụng"
                }
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="created_by_id" label="Người tạo">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("created_by_id", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={24} className="flex justify-end">
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </Col>
      </Row>
    </Form>
  );
  let Content = undefined;
  if (loading) {
    Content = (
      <div className="p-2">
        {" "}
        <Spin />{" "}
      </div>
    );
  } else if (dataSource.length == 0) {
    Content = <div className="p-2 text-center"> Chưa có tài liệu nào</div>;
  } else {
    Content = (
      <>
        {dataSource.map((record, key) => {
          return (
            <Col span={24} key={record.id} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>STT:</strong> {key + 1}
                </p>
                <p className="my-1">
                  <strong>Mã tài liệu:</strong> {record.ma}
                </p>
                <p className="my-1">
                  <strong>Tên tài liệu:</strong> {record.ten}
                </p>
                <p className="my-1">
                  <strong>Mã loại tài liệu:</strong> {record.loai_tai_lieu?.ma}
                </p>
                <p className="my-1">
                  <strong>Loại tài liệu:</strong> {record.loai_tai_lieu?.loai}
                </p>
                {/* <p className="my-1">
                  <strong>Phạm vi áp dụng:</strong> {record.pham_vi}
                </p> */}
                <p className="my-1">
                  <strong>Mô tả:</strong> {record.mo_ta}
                </p>
                <p className="my-1">
                  <strong>Link tài liệu:</strong>
                  {record.link}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong>{" "}
                  {record.trang_thai == "1-Đang sử dụng" ? (
                    <Switch size="small" checked={true} />
                  ) : record.trang_thai == "2-Dừng sử dụng" ? (
                    <Switch size="small" checked={false} />
                  ) : (
                    <></>
                  )}
                </p>
                <p className="my-1">
                  <strong>Người tạo:</strong> {record.created_by?.username}
                </p>

                <div className="flex justify-center">
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setData(record);
                        setIsModalEdit(true);
                        setIsEdit(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => {
                        setData(record);
                        setIsModalDelete(true);
                      }}
                    />
                  </Tooltip>
                </div>
              </Card>
            </Col>
          );
        })}

        <div
          className="flex justify-between items-center flex-grow-0"
          style={{
            padding: " 8px 0"
          }}
        >
          <Pagination
            current={pagination.page}
            pageSize={pagination.itemsPerPage}
            showSizeChanger
            onChange={onShowSizeChange}
            total={pagination.total}
          />
          <div className="px-2">Tổng số: {pagination.total || 0}</div>
        </div>

        <EditorDialog
          isEdit={isEdit}
          setEdit={setIsEdit}
          data={data}
          showModal={isModalEdit}
          setShowModal={setIsModalEdit}
          setKeyRender={setKeyRender}
        />
        <DeleteDialog
          openModal={isModalDelete}
          translation="tai-lieu-chung"
          closeModal={setIsModalDelete}
          name={data?.ma}
          apiDelete={() => data && taiLieuGiaoVienApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý tài liệu"
        extraTitle={
          <Button onClick={() => setIsModalEdit(true)} type="primary" style={{ float: "right" }}>
            {t("action.create_new")}
          </Button>
        }
      >
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};
