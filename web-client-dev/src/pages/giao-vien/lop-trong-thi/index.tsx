import { FC, useCallback, useEffect, useState } from "react";

import lopThiApi from "@/api/lop/lopThiCuaGiaoVien.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { LopThi } from "@/interface/lop-thi";
import PageContainer from "@/Layout/PageContainer";
import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Button, Card, Col, DatePicker, Form, Input, Pagination, Row, Select, Spin } from "antd";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import Calendar from "./Calendar";

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
const LopThiPage = () => {
  const { items: kiHoc } = useKiHoc();
  const kiHienGio = useAppSelector(getKiHienGio);

  const contentDesktop = () => <LopThiPageDesktop kiHoc={kiHoc} />;
  const contentMobile = () => kiHienGio && <LopThiPageMobile kiHoc={kiHoc} kiHienGio={kiHienGio} />;
  return (
    <>
      <PageContainer title="Danh sách lớp coi thi">
        <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
      </PageContainer>
    </>
  );
};

export default LopThiPage;

const LopThiPageDesktop: FC<{ kiHoc: string[] }> = () => {
  const { t } = useTranslation("lop-thi");
  const { format: formatDotThi, getData: getLoaiDotThiData } = useLoaiLopThi();
  const [dataSource, setDataSource] = useState<LopThi[]>([]);
  const kiHienGio = useAppSelector(getKiHienGio);
  const { getData: getKiHocData } = useKiHoc();

  const [columnDefs] = useState<ColDef<LopThi & ActionField>[]>([
    {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData: getKiHocData
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData: getKiHocData
      }
    },
    {
      headerName: t("field.loai"),
      field: "loai",
      filter: SelectFilter,
      floatingFilter: true,
      cellRenderer: loaiCellRenderer,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      cellRendererParams: {
        format: formatDotThi
      },
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Đợt thi",
        getData: getLoaiDotThiData
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Đợt thi",
        getData: getLoaiDotThiData
      }
    },
    {
      headerName: t("field.ngay_thi"),
      field: "ngay_thi",
      filter: "agDateColumnFilter",
      cellRenderer: DateFormat
    },

    {
      headerName: t("field.kip_thi"),
      field: "kip_thi",
      filter: "agTextColumnFilter"
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await lopThiApi.list();
      if (response.data) {
        setDataSource(response.data);
      }
    };

    fetchData();
  }, []);
  const getRowStyle = (params: any) => {
    if (!params.data) return { background: "#fff" };
    if (dayjs().isAfter(dayjs(params.data.ngay_thi))) {
      return { background: "#999" };
    }
  };
  const [initFilter] = useState({
    ki_hoc: {
      filterType: "text",
      type: "contains",
      filter: kiHienGio
    }
  });
  return (
    <>
      <Row className="flex-grow-0">
        <Col span={24}>
          <BaseTable
            columns={columnDefs}
            api={lopThiApi.list}
            gridOption={{ defaultColDef: defaultColDef }}
            getRowStyle={getRowStyle}
            initFilter={initFilter}
          ></BaseTable>
        </Col>
        <Col span={24}>
          <Calendar event={dataSource} />
        </Col>
      </Row>
    </>
  );
};

const LopThiPageMobile: FC<{
  kiHoc: string[];
  kiHienGio: string;
}> = ({ kiHoc, kiHienGio }) => {
  const [dataSource, setDataSource] = useState<LopThi[]>([]);
  const { items: dotThi, format: formatDotThi } = useLoaiLopThi();
  const [loading, setLoading] = useState<boolean>(false);
  // const [keyRender, setKeyRender] = useState(0);
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
      const res = await lopThiApi.list(filter);
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
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        },
        kip_thi: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_hp
        },
        loai: {
          filterType: "text",
          type: "contains",
          filter: filter.loai
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ngay_thi) {
      sendData.filterModel.ngay_thi = {
        dateFrom: filter.ngay_thi,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
    getData(sendData);
  };

  useEffect(() => {
    form.setFieldsValue({ ki_hoc: kiHienGio });
    onSubmit({ ki_hoc: kiHienGio });
  }, []);

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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="loai" label="Đợt thi">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("loai", value);
              }}
            >
              {dotThi.map((item) => (
                <Select.Option key={item.value}>{item.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ngay_thi" label="Ngày thi">
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ngay_thi", date);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="kip_thi" label="Kíp thi">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("kip_thi", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có lớp thi nào</div>;
  } else {
    Content = (
      <>
        {dataSource.map((record: any, key) => {
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
                  <strong>Đợt thi:</strong> {formatDotThi(record.loai)}
                </p>
                <p className="my-1">
                  <strong>Ngày thi:</strong> {formatDate(record.ngay_thi)}
                </p>
                <p className="my-1">
                  <strong>Kíp thi:</strong> {record.kip_thi}
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

        <Col span={24}>
          <Calendar event={dataSource} />
        </Col>
      </>
    );
  }

  return (
    <div>
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </div>
  );
};

const DateFormat: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  if (!data.ngay_thi) {
    return <span></span>;
  }

  const formattedDate = dayjs(data.ngay_thi).format("DD/MM/YYYY");
  return <>{<span>{formattedDate}</span>}</>;
};

export interface LoaiCellRendererParams extends ICellRendererParams {
  format: (value: string) => string;
}
const loaiCellRenderer: FC<LoaiCellRendererParams> = (params) => {
  if (!params.value) {
    return "";
  }
  return params.format(params.value);
};
const formatDate = (date: any) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};
