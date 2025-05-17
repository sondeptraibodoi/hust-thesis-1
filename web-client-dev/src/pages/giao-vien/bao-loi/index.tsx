import baoLoiApi from "@/api/bao-loi/baoLoi.api";
import BaseTable from "@/components/base-table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { BaoLoi } from "@/interface/bao-loi";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined, EditOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Pagination,
  Row,
  Select, // notification,
  Spin,
  Tag,
  Tooltip
} from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// import EditDialog from "@/components/editDialog";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import BaseResponsive from "@/components/base-responsive";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { Paginate } from "@/interface/axios";
import { useAppSelector } from "@/stores/hook";
import { PaginationProps } from "antd/lib";
import { Link } from "react-router-dom";
import ShowDetailDialog from "./showDetail-dialog";
// import { useAppSelector } from "@/stores/hook";
// import { getAuthUser } from "@/stores/features/auth";

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const statusoption = [
  {
    value: 1,
    label: "Đã xử lý"
  },
  {
    value: 0,
    label: "Chưa xử lý"
  }
];
const lyDoOption = [
  { key: "option1", value: "Chưa có điểm" },
  { key: "option2", value: "Sai điểm" },
  { key: "option3", value: "Trạng thái thanh toán không đổi" },
  { key: "option4", value: "Khác" }
];
const BaoLoiPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <BaoLoiPageDesktop />;
  const contentMobile = () => <BaoLoiPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default BaoLoiPage;

const BaoLoiPageDesktop: FC<any> = () => {
  const { t } = useTranslation("bao-loi");
  const [data, setData] = useState<BaoLoi>();
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [columnDefs, setColumDefs] = useState<ColDef<BaoLoi & ActionField>[]>([]);
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
  useEffect(() => {
    const ki_hoc_columns: ColDef = {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilter: true
    };
    if (kiHoc && kiHoc.length > 0) {
      ki_hoc_columns.floatingFilterComponent = SelectFloatingFilterCompoment;
      ki_hoc_columns.floatingFilterComponentParams = {
        suppressFilterButton: true,
        placeholder: "Kì học",
        data: kiHoc.map((x: any) => ({ value: x, label: x })),
        kiHienGio: kiHienGio
      };
    }
    setColumDefs([
      ki_hoc_columns,
      {
        headerName: t("field.sinh_vien_id"),
        field: "mssv",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.name"),
        field: "name",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.lop_id"),
        field: "ma",
        filter: "agTextColumnFilter",
        cellRenderer: MaLopCellRender
      },
      {
        headerName: t("field.lop_thi_id"),
        field: "ma_lop_thi",
        filter: "agTextColumnFilter",
        cellRenderer: MaLopThiCellRender
      },
      {
        headerName: t("field.tieu_de"),
        field: "tieu_de",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ly_do"),
        field: "ly_do",
        filter: SelectFilter,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: "Lý do",
          data: lyDoOption
        }
      },
      {
        headerName: t("field.trang_thai"),
        field: "trang_thai",
        filter: SelectFilter,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: "Trạng thái",
          data: statusoption
        },
        cellRenderer: (params: any) => {
          return params.value === 1 ? <Tag color="success">Đã xử lý</Tag> : <Tag color="error">Chưa xử lý</Tag>;
        }
      },
      {
        headerName: t("field.action"),
        field: "action",
        pinned: "right",
        width: 150,
        cellRenderer: ActionCellRender,
        cellRendererParams: {
          onUpdateItem: (item: BaoLoi) => {
            setData(item);
            setIsModalEdit(true);
          },
          onDeleteItem: (item: BaoLoi) => {
            setData(item);
            setIsModalDelete(true);
          }
        },
        filter: false
      }
    ]);
  }, [kiHoc]);

  return (
    <>
      <PageContainer title="Danh sách báo lỗi">
        {columnDefs.length > 0 && (
          <BaseTable
            key={keyRender}
            columns={columnDefs}
            api={baoLoiApi.list}
            gridOption={{ defaultColDef: defaultColDef }}
          ></BaseTable>
        )}
      </PageContainer>

      <ShowDetailDialog
        apiEdit={baoLoiApi.edit}
        translation={"bao-loi-sinh-vien"}
        data={data}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        closeModal={setIsModalEdit}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="bao-loi-sinh-vien"
        closeModal={setIsModalDelete}
        name={data?.tieu_de}
        apiDelete={() => data && baoLoiApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};
const BaoLoiPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<BaoLoi[]>([]);
  const [data, setData] = useState<BaoLoi>();
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
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

  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await baoLoiApi.list(filter);
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
    const sendData = {
      filterModel: {
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        },
        mssv: {
          filterType: "text",
          type: "contains",
          filter: filter.mssv
        },
        name: {
          filterType: "text",
          type: "contains",
          filter: filter.name
        },
        ma: {
          filterType: "text",
          type: "contains",
          filter: filter.ma
        },
        ma_lop_thi: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop_thi
        },
        tieu_de: {
          filterType: "text",
          type: "contains",
          filter: filter.tieu_de
        },
        ly_do: {
          filterType: "text",
          type: "contains",
          filter: filter.ly_do
        },
        trang_thai: {
          filterType: "text",
          type: "contains",
          filter: filter.trang_thai
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
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
        ki_hoc: kiHienGio
      }}
    >
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ki_hoc" label="Kì học">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("ki_hoc", value);
              }}
            >
              {kiHoc.map((item) => (
                <Select.Option key={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="mssv" label="MSSV">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("mssv", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="name" label="Tên sinh viên">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("name", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã lớp học">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_lop_thi" label="Mã lớp thi">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_lop_thi", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="tieu_de" label="Tiêu đề">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("tieu_de", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ly_do" label="Lý do">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("ly_do", value);
              }}
            >
              {lyDoOption.map((item) => (
                <Select.Option key={item.value}>{item.value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="trang_thai" label="Trạng thái">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("trang_thai", value);
              }}
            >
              {statusoption.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
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
    Content = <div className="p-2 text-center"> Chưa có đơn báo lỗi nào</div>;
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
                  <strong>Kì học:</strong> {record.ki_hoc}
                </p>
                <p className="my-1">
                  <strong>MSSV:</strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>Tên sinh viên:</strong> {record.name}
                </p>
                <p className="my-1">
                  <strong>Mã lớp học:</strong> {record.ma}{" "}
                  {
                    <Link to={"/sohoa/lop-hoc/" + record.lop_id} className="mr-2 text-black" onClick={() => {}}>
                      <Button shape="circle" type="text">
                        <UnorderedListOutlined />
                      </Button>
                    </Link>
                  }
                </p>
                <p className="my-1">
                  <strong>Mã lớp thi:</strong> {record.ma_lop_thi}{" "}
                  {
                    <Link
                      to={"/sohoa/lop-hoc/" + record.lop_id + "/sinh-vien/" + record.lop_thi_id}
                      className="mr-2 text-black"
                    >
                      <Button shape="circle" type="text">
                        <UnorderedListOutlined />
                      </Button>
                    </Link>
                  }
                </p>
                <p className="my-1">
                  <strong>Tiêu đề:</strong> {record.tieu_de}
                </p>
                <p className="my-1">
                  <strong>Lý do:</strong> {record.ly_do}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong>{" "}
                  {record.trang_thai === 1 ? <Tag color="success">Đã xử lý</Tag> : <Tag color="error">Chưa xử lý</Tag>}
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
        <ShowDetailDialog
          apiEdit={baoLoiApi.edit}
          translation={"bao-loi-sinh-vien"}
          data={data}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          closeModal={setIsModalEdit}
        />
        <DeleteDialog
          openModal={isModalDelete}
          translation="bao-loi-sinh-vien"
          closeModal={setIsModalDelete}
          name={data?.tieu_de}
          apiDelete={() => data && baoLoiApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer title="Danh sách báo lỗi">
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  const [loading, setLoading] = useState(false);
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        {loading ? (
          <Spin />
        ) : (
          <Button
            shape="circle"
            icon={<EditOutlined />}
            type="text"
            onClick={() => {
              onUpdateItem(data, [loading, setLoading]);
            }}
          />
        )}
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
const MaLopCellRender: FC<{ data: BaoLoi }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }

  return (
    <>
      <Link to={"/sohoa/lop-hoc/" + data.lop_id} className="mr-2 text-black" onClick={() => {}}>
        <Button shape="circle" type="text">
          <UnorderedListOutlined />
        </Button>
      </Link>
      {data.ma}
    </>
  );
};

const MaLopThiCellRender: FC<{ data: BaoLoi }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Link to={"/sohoa/lop-hoc/" + data.lop_id + "/sinh-vien/" + data.lop_thi_id} className="mr-2 text-black">
        <Button shape="circle" type="text">
          <UnorderedListOutlined />
        </Button>
      </Link>

      {data.ma_lop_thi}
    </>
  );
};
