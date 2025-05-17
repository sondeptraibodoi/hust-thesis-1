import { Button, Card, Col, DatePicker, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import {
  CauHoiCellRender,
  DoKhoCellRender,
  LoaiCauHoiCellRender,
  TrangThaiPhanBienCellRender
} from "@/components/TrangThaiCellRender";
import { FC, useCallback, useEffect, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import { ColDef } from "ag-grid-community";
import { DateFormat } from "@/components/format/date";
import { HocPhanCauHoi } from "@/interface/cauHoi";
import { Link } from "react-router-dom";
import MathDisplay from "@/components/MathDisplay";
import PageContainer from "@/Layout/PageContainer";
import { Paginate } from "@/interface/axios";
import { PaginationProps } from "antd/lib";
import { RightOutlined } from "@ant-design/icons";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const isTrangThai = [
  {
    value: "cho_duyet",
    label: "Chờ duyệt"
  },
  {
    value: "tu_choi",
    label: "Từ chối"
  },
  {
    value: "phe_duyet",
    label: "Phê duyệt"
  }
];

const isLoai = [
  { value: "single", label: "Một đáp án" },
  { value: "multi", label: "Nhiều đáp án" }
];

const doKho = [
  {
    value: "easy",
    label: "Dễ"
  },
  {
    value: "medium",
    label: "Trung bình"
  },
  {
    value: "hard",
    label: "Khó"
  }
];

const CauHoiPhanBienGvPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <CauHoiPhanBienPageDesktop />;
  const contentMobile = () => <CauHoiPhanBienPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default CauHoiPhanBienGvPage;

const ActionCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }

  return (
    <>
      <Tooltip title={"Xem đầy đủ"}>
        <Link to={`${data.cau_hoi_id}`}>
          <Button
            shape="circle"
            icon={<RightOutlined />}
            type="text"
            disabled={data.trang_thai_cau_hoi !== "cho_duyet"}
          />
        </Link>
      </Tooltip>
    </>
  );
};

const NoiDungCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return <MathDisplay mathString={data?.cau_hoi?.noi_dung} />;
};

const CauHoiPhanBienPageDesktop: FC<any> = () => {
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");

  const [columnDefs] = useState<ColDef<HocPhanCauHoi & ActionField>[]>([
    {
      headerName: t("field.ma_hoc_phan"),
      field: "cau_hoi.primary_chuong.ma_hoc_phan",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ten"),
      field: "cau_hoi.primary_chuong.chuong.ten",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.noi_dung_cau_hoi"),
      field: "cau_hoi.noi_dung",
      filter: "agTextColumnFilter",
      cellClass: "customCell",
      cellRenderer: NoiDungCellRender
    },
    {
      headerName: t("field.loai"),
      field: "cau_hoi.loai",
      cellRenderer: LoaiCauHoiCellRender,
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        data: isLoai
      }
    },
    {
      headerName: t("field.do_kho"),
      field: "cau_hoi.primary_chuong.do_kho",
      cellRenderer: (data: any) => {
        return (
          data?.data?.cau_hoi?.primary_chuong?.do_kho &&
          DoKhoCellRender({ data: data?.data?.cau_hoi.primary_chuong.do_kho })
        );
      },
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        placeholder: t("field.do_kho"),
        data: doKho
      }
    },
    {
      headerName: t("field.ngay_han_phan_bien"),
      field: "ngay_han_phan_bien",
      filter: "agDateColumnFilter",
      cellRenderer: ({ value }: any) => <DateFormat value={value} />
    },
    {
      headerName: t("field.ly_do"),
      field: "ly_do",
      cellClass: "customCell",
      filter: "agTextColumnFilter",
      cellRenderer: (data: any) => data?.data?.ly_do && CauHoiCellRender({ data: data?.data?.ly_do })
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai_cau_hoi",
      cellRenderer: (data: any) =>
        data?.data?.trang_thai_cau_hoi && TrangThaiPhanBienCellRender({ data: data?.data?.trang_thai_cau_hoi }),
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        data: isTrangThai
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 120,
      minWidth: 120,
      cellRenderer: ActionCellRender,
      filter: false
    }
  ]);

  return (
    <>
      <PageContainer title="Danh sách phản biện câu hỏi">
        <BaseTable
          columns={columnDefs}
          api={cauHoiApi.listCauHoiPhanBienGv}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
    </>
  );
};

const CauHoiPhanBienPageMobile: FC<{ setKeyRender: any }> = () => {
  const [dataSource, setDataSource] = useState<HocPhanCauHoi[]>([]);

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
      const res = await cauHoiApi.listCauHoiPhanBienGv(filter);
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
    if (filter.ma_hoc_phan) {
      sendData.filterModel["cau_hoi.primary_chuong.ma_hoc_phan"] = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_hoc_phan
      };
    }
    if (filter.chu_de) {
      sendData.filterModel["cau_hoi.primary_chuong.chuong.ten"] = {
        filterType: "text",
        type: "contains",
        filter: filter.chu_de
      };
    }
    if (filter.noi_dung) {
      sendData.filterModel["cau_hoi.noi_dung"] = {
        filterType: "text",
        type: "contains",
        filter: filter.noi_dung
      };
    }
    if (filter.loai) {
      sendData.filterModel["cau_hoi.loai"] = {
        filterType: "text",
        type: "contains",
        filter: filter.loai
      };
    }
    if (filter.do_kho) {
      sendData.filterModel["cau_hoi.primary_chuong.do_kho"] = {
        filterType: "text",
        type: "contains",
        filter: filter.do_kho
      };
    }
    if (filter.ngay_han_phan_bien) {
      sendData.filterModel.ngay_han_phan_bien = {
        dateFrom: filter.ngay_han_phan_bien,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
    if (filter.ly_do) {
      sendData.filterModel.ly_do = {
        filterType: "text",
        type: "contains",
        filter: filter.noi_dung
      };
    }
    if (filter.trang_thai) {
      sendData.filterModel.trang_thai = {
        filterType: "text",
        type: "contains",
        filter: filter.trang_thai
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
        trang_thai: "cho_duyet"
      }}
    >
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hoc_phan" label="Mã học phần">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("ma_hoc_phan", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="chu_de" label="Chủ đề">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("chu_de", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="noi_dung" label="Nội dung">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("noi_dung", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="loai" label="Loại">
            <Select
              allowClear
              onChange={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("loai", e);
                }
              }}
              options={[
                { value: "single", label: "Một đáp án" },
                { value: "multi", label: "Nhiều đáp án" }
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="do_kho" label="Độ khó">
            <Select
              allowClear
              onChange={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("do_kho", e);
                }
              }}
              options={doKho}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="ngay_han_phan_bien"
            label="Hạn phản biện"
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ngay_han_phan_bien", date);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ly_do" label="Lý do">
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ly_do", e.target.value);
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
                  value: "cho_duyet",
                  label: "Chờ duyệt"
                },
                {
                  value: "tu_choi",
                  label: "Từ chối"
                },
                {
                  value: "phe_duyet",
                  label: "Phê duyệt"
                }
              ]}
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
    Content = <div className="p-2 text-center"> Chưa có câu hỏi nào</div>;
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
                  <strong>Mã học phần:</strong> {record.cau_hoi.primary_chuong?.ma_hoc_phan}
                </p>
                <p className="my-1">
                  <strong>Chủ đề:</strong> {record.cau_hoi.primary_chuong?.chuong.ten}
                </p>
                <p className="my-1">
                  <strong>Nội dung:</strong> <MathDisplay mathString={record.cau_hoi?.noi_dung} />
                </p>
                <p className="my-1">
                  <strong>Loại: </strong>
                  {LoaiCauHoiCellRender({ data: record })}
                </p>
                <p className="my-1">
                  <strong>Độ khó: </strong> {DoKhoCellRender({ data: record.cau_hoi.primary_chuong?.do_kho })}
                </p>
                <p className="my-1">
                  <strong>Hạn phản biện:</strong> {formatDate(record.ngay_han_phan_bien)}
                </p>
                <p className="my-1">
                  <strong>Lý do:</strong> {CauHoiCellRender({ data: record.ly_do || "" })}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong> {TrangThaiPhanBienCellRender({ data: record.trang_thai_cau_hoi })}
                </p>
                {record.trang_thai_cau_hoi == "cho_duyet" && (
                  <div className="flex justify-center">
                    <Tooltip title="Xem đầy đủ">
                      <Link to={`${record.cau_hoi_id}`}>
                        <Button shape="circle" icon={<RightOutlined />} type="text" />
                      </Link>
                    </Tooltip>
                  </div>
                )}
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
      <PageContainer title="Danh sách phản biện câu hỏi">
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};

const formatDate = (date: any) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};
