import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin } from "antd";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import React, { FC, useCallback, useEffect, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import { DiemPhucKhao } from "@/interface/bangdiem";
import ImportDiemPhucKhaoAmin from "./import-diem-dialog";
import PageContainer from "@/Layout/PageContainer";
import { Paginate } from "@/interface/axios";
import { PaginationProps } from "antd/lib";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import diemPhucKhaoApi from "@/api/bangDiem/diemPhucKhao.api";
import importApi from "@/api/import.api";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const BangDiemPhucKhaoPage: React.FC = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <BangDiemPhucKhaoPageDesktop />;
  const contentMobile = () => <BangDiemPhucKhaoPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default BangDiemPhucKhaoPage;

const BangDiemPhucKhaoPageDesktop: FC<any> = () => {
  const { t } = useTranslation("diem-phuc-khao");
  const [kiHoc, kiHienGio] = useState<string[]>([]);
  const { getData } = useKiHoc();
  const { items: dotThi, format: formatDotThi } = useLoaiLopThi();
  // const { format: dotThi } = useLoaiLopThi();
  const [columnDefs, setColumDefs] = useState<ColDef<DiemPhucKhao & ActionField>[]>([]);
  useEffect(() => {
    const loai_columns: ColDef = {
      headerName: t("field.dot_thi"),
      field: "dot thi",
      filter: true,
      floatingFilter: true,
      cellRenderer: loaiCellRender
    };
    if (dotThi && dotThi.length > 0) {
      loai_columns.floatingFilterComponent = SelectFloatingFilterCompoment;
      loai_columns.floatingFilterComponentParams = {
        suppressFilterButton: true,
        placeholder: "Đợt thi",
        data: dotThi.map((x) => ({
          label: x.title,
          value: x.value
        }))
      };
      loai_columns.cellRendererParams = {
        format: formatDotThi
      };
    }
    setColumDefs([
      {
        headerName: t("Kì học "),
        field: "ki_hoc",
        filter: SelectFilter,
        floatingFilter: true,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        filterParams: {
          suppressFilterButton: true,
          placeholder: "Kì học",
          getData
        },
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: "Kì học",
          getData
        }
      },
      {
        headerName: t("field.ma_lop_thi"),
        field: "ma_lop_thi",
        filter: "agTextColumnFilter",
        floatingFilter: true
      },
      {
        headerName: t("field.dot_thi"),
        field: "dot_lop_thi",
        filter: false,
        cellRenderer: loaiCellRender,
        cellRendererParams: {
          format: formatDotThi
        }
      },
      {
        headerName: t("field.mssv"),
        field: "sinh_vien_mssv",
        filter: "agTextColumnFilter",
        floatingFilter: true
      },
      {
        headerName: t("field.ten_sv"),
        field: "sinh_vien_name",
        filter: "agTextColumnFilter",
        floatingFilter: true
      },
      {
        headerName: t("field.diem"),
        field: "diem",
        filter: "agTextColumnFilter",
        floatingFilter: true,
        valueFormatter: ({ value }) => (value < 0 ? "-" : value)
      }
      // {
      //   headerName: t("field.ghi_chu"),
      //   field: "ghi_chu",
      //   filter: "agTextColumnFilter",
      //   floatingFilter: true
      // }
    ]);
  }, [formatDotThi, kiHoc]);
  const [initFilter] = useState({
    ki_hoc: {
      filterType: "text",
      type: "contains",
      filter: kiHienGio
    }
  });
  const handleDownloadFile = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = "public/download/mau_nhap_diem_phuc_khao.xlsx";
    downloadLink.download = "mau_nhap_diem_phuc_khao.xlsx";
    downloadLink.click();
  };
  return (
    <>
      <PageContainer
        title={t("title.title")}
        extraTitle={
          <div style={{ float: "right" }}>
            <Button className="mr-2" onClick={handleDownloadFile} type="primary">
              Tải tệp dữ liệu mẫu
            </Button>
            <ImportDiemPhucKhaoAmin
              suggestType="giao-vien"
              fieldName={[
                { name: "sinh_vien_id" },
                { name: "ma_hp" },
                { name: "nhom" },
                { name: "ma_lop" },
                { name: "ma_lop_thi" },
                { name: "diem" },
                { name: "diem_moi" },
                { name: "ghi_chu" }
              ]}
              fileDownloadName="diem_phuc_khao"
              downloadable={false}
              translation="import-diem-phuc-khao"
              uploadformApi={importApi.importDiemPhucKhao}
            />
          </div>
        }
      >
        <BaseTable
          api={diemPhucKhaoApi.list}
          columns={columnDefs}
          initFilter={initFilter}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
    </>
  );
};
const BangDiemPhucKhaoPageMobile: FC<any> = () => {
  const [dataSource, setDataSource] = useState<DiemPhucKhao[]>([]);
  const { items: DotThi } = useLoaiLopThi();
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const { format: formatDotThi } = useLoaiLopThi();
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
      const res = await diemPhucKhaoApi.list(filter);
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
  const handleDownloadFile = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = "public/download/mau_nhap_diem_phuc_khao.xlsx";
    downloadLink.download = "mau_nhap_diem_phuc_khao.xlsx";
    downloadLink.click();
  };
  const onSubmit = (filter?: any) => {
    const sendData: any = {
      filterModel: {
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        },
        "lop_thi.ma": {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop_thi
        },
        "lop_thi.loai": {
          filterType: "text",
          type: "contains",
          filter: filter.dot_thi
        },
        "sinh_vien.mssv": {
          filterType: "text",
          type: "contains",
          filter: filter.mssv
        },
        "sinh_vien.name": {
          filterType: "text",
          type: "contains",
          filter: filter.sinh_vien
        },
        diem: {
          filterType: "text",
          type: "contains",
          filter: filter.diem
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ghi_chu) {
      sendData.filterModel.ghi_chu = {
        filterType: "text",
        type: "contains",
        filter: filter.ghi_chu
      };
    }
    getData(sendData);
  };
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
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="dot_thi" label="Đợt thi">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("dot_thi", value);
              }}
            >
              {DotThi.map((item) => (
                <Select.Option key={item.value}>{item.title}</Select.Option>
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="sinh_vien" label="Tên sinh viên">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("sinh_vien", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="diem" label="Điểm mới">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("diem", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ghi_chu" label="Ghi chú">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ghi_chu", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có điểm phúc khảo nào</div>;
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
                  <strong>Mã lớp thi:</strong> {record.lop_thi.ma}
                </p>
                <p className="my-1">
                  <strong>Đợt thi:</strong> {formatDotThi(record.lop_thi.loai)}
                </p>
                <p className="my-1">
                  <strong>MSSV: </strong>
                  {record.sinh_vien.mssv}
                </p>
                <p className="my-1">
                  <strong>Tên sinh viên: </strong>
                  {record.sinh_vien.name}
                </p>
                <p className="my-1">
                  <strong>Điểm mới: </strong>
                  {record.diem}
                </p>
                <p className="my-1">
                  <strong> Ghi chú: </strong>
                  {record.ghi_chu}
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
      <PageContainer
        title="Quản lý mã học phần"
        extraTitle={
          <div style={{ float: "right" }}>
            <Button className="my-2" onClick={handleDownloadFile} type="primary">
              Tải tệp dữ liệu mẫu
            </Button>
            <ImportDiemPhucKhaoAmin
              suggestType="giao-vien"
              fieldName={[
                { name: "ki_hoc" },
                { name: "sinh_vien_id" },
                { name: "ma_hp" },
                { name: "nhom" },
                { name: "ma_lop" },
                { name: "ma_lop_thi" },
                { name: "diem" },
                { name: "diem_moi" },
                { name: "ghi_chu" }
              ]}
              fileDownloadName="diem_phuc_khao"
              downloadable={false}
              translation="import-diem-phuc-khao"
              uploadformApi={importApi.importDiemPhucKhao}
            />
          </div>
        }
      >
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};

export interface LoaiCellRendererParams extends ICellRendererParams {
  format: (value: string) => string;
}
const loaiCellRender: FC<LoaiCellRendererParams> = (params) => {
  if (!params.value) {
    return "";
  }
  return params.format(params.value);
};
