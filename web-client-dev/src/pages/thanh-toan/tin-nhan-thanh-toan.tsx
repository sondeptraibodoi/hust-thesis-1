import PageContainer from "@/Layout/PageContainer";
import importApi from "@/api/import.api";
import tinNhanAdminApi from "@/api/tinNhan/tinNhanAdmin.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import ImportExcelCompoment from "@/components/importDrawer";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { TinNhan } from "@/interface/tinNhan";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, DatePicker, Form, Input, Pagination, Row, Select, Spin, Tag } from "antd";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import { FC, useCallback, useEffect, useState } from "react";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const TinNhanThanhToanPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <TinNhanThanhToanPageDesktop />;
  const contentMobile = () => <TinNhanThanhToanPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default TinNhanThanhToanPage;

const TinNhanThanhToanPageDesktop: FC<any> = () => {
  const statusoption = [
    {
      value: 0,
      label: "Chưa thanh toán"
    },
    {
      value: 1,
      label: "Đã thanh toán"
    }
  ];
  const [columnDefs] = useState<ColDef<TinNhan & ActionField>[]>([
    {
      headerName: "Tin nhắn",
      field: "tin_nhan",
      filter: "agTextColumnFilter"
    },
    {
      headerName: "Phí",
      field: "gia",
      filter: "agTextColumnFilter",
      maxWidth: 180
    },

    {
      headerName: "Mã chuyển khoản",
      field: "ma_thanh_toan",
      filter: "agTextColumnFilter"
    },
    {
      headerName: "Thời gian nhận",
      field: "ngay_nhan",
      filter: "agDateColumnFilter",
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      headerName: "Thời gian gửi",
      field: "created_at",
      filter: "agDateColumnFilter",
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      headerName: "Thời gian cập nhật",
      field: "updated_at",
      filter: "agDateColumnFilter",
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      headerName: "Trạng thái",
      field: "trang_thai",
      filter: SelectFilter,
      floatingFilter: true,
      cellRenderer: StatusCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Trạng thái",
        data: statusoption
      }
    }
  ]);
  const [keyRender, setKeyRender] = useState(0);

  return (
    <>
      <PageContainer
        title="Danh sách tin nhắn"
        extraTitle={
          <div style={{ float: "right" }}>
            <ImportExcelCompoment
              fieldName={[{ name: "phi" }, { name: "tin_nhan" }]}
              uploadType=" .xls,.xlsx"
              buttonElement={<Button type="primary">Nhập excel</Button>}
              appcectType={[
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv"
              ]}
              translation="import-tin-nhan"
              suggestType="import-tin-nhan"
              uploadformApi={importApi.importTinNhan}
              setKeyRender={setKeyRender}
            />
          </div>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={tinNhanAdminApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
          key={keyRender}
        ></BaseTable>
      </PageContainer>
    </>
  );
};
const TinNhanThanhToanPageMobile: FC<any> = () => {
  const [dataSource, setDataSource] = useState<TinNhan[]>([]);
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
  const statusoption = [
    {
      value: 0,
      label: "Chưa thanh toán"
    },
    {
      value: 1,
      label: "Đã thanh toán"
    }
  ];
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await tinNhanAdminApi.list(filter);
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
      filterModel: {
        ma_thanh_toan: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_thanh_toan
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
    if (filter.tin_nhan) {
      sendData.filterModel.tin_nhan = {
        filterType: "text",
        type: "contains",
        filter: filter.tin_nhan
      };
    }
    if (filter.gia) {
      sendData.filterModel.gia = {
        filterType: "text",
        type: "contains",
        filter: filter.gia
      };
    }
    if (filter.ngay_nhan) {
      sendData.filterModel.ngay_nhan = {
        dateFrom: filter.ngay_nhan,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
    if (filter.created_at) {
      sendData.filterModel.created_at = {
        dateFrom: filter.created_at,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
    if (filter.updated_at) {
      sendData.filterModel.updated_at = {
        dateFrom: filter.updated_at,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
    getData(sendData);
  };

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="tin_nhan" label="Tin nhắn">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("tin_nhan", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="gia" label="Phí">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_thanh_toan" label="Mã chuyển khoản">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_thanh_toan", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ngay_nhan" label="Thời gian nhận">
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ngay_nhan", date);
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="created_at" label="Thời gian gửi">
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("created_at", date);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="updated_at" label="Thời gian cập nhật">
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("updated_at", date);
              }}
            />
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
    Content = <div className="p-2 text-center"> Chưa có tin nhắn thanh toán nào</div>;
  } else {
    Content = (
      <>
        {dataSource.map((record, key) => {
          return (
            <Col span={24} key={record.id} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>STT: </strong> {key + 1}
                </p>
                <p className="my-1">
                  <strong>Tin nhắn: </strong> {record.tin_nhan}
                </p>
                <p className="my-1">
                  <strong>Phí: </strong> {record.gia}
                </p>
                <p className="my-1">
                  <strong>Mã chuyển khoản: </strong> {record.ma_thanh_toan}
                </p>
                <p className="my-1">
                  <strong>Thời gian nhận: </strong> {formatDate(record.ngay_nhan)}
                </p>
                <p className="my-1">
                  <strong>Thời gian gửi: </strong> {formatDate(record.created_at)}
                </p>
                <p className="my-1">
                  <strong>Thời gian cập nhật: </strong> {formatDate(record.updated_at)}
                </p>
                <p className="my-1">
                  <strong>Trạng thái: </strong>{" "}
                  {record.trang_thai == 0 ? (
                    <Tag color="red">Chưa thanh toán</Tag>
                  ) : (
                    <Tag color="success">Đã thanh toán</Tag>
                  )}
                </p>
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
      </>
    );
  }

  return (
    <div>
      <PageContainer title="Danh sách tin nhắn">
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};

const StatusCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tag key={data?.trang_thai} color={data?.trang_thai == 0 ? "red" : "success"}>
        {data?.trang_thai == 0 ? "Chưa thanh toán" : "Đã thanh toán"}
      </Tag>
    </>
  );
};

const formatDate = (date: any) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};
