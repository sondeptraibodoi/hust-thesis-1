import kiHocApi from "@/api/kiHoc/kiHoc.api";
import thuctapApi from "@/api/lop/thuctap.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { SinhVienPhanBien } from "@/interface/lop";
import PageContainer from "@/Layout/PageContainer";
import { useAppSelector } from "@/stores/hook";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const DoAnPage: FC<any> = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <DoAnPageDesktop />;
  const contentMobile = () => <DoAnPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default DoAnPage;

const DoAnPageDesktop: FC<any> = () => {
  const { t } = useTranslation("do-an");
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [keyRender] = useState(0);

  const [columnDefs, setColumDefs] = useState<ColDef<SinhVienPhanBien & ActionField>[]>([]);
  const [kiHoc, setKihoc] = useState<string[]>([]);

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
        headerName: t("field.ma"),
        field: "ma",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ma_hp"),
        field: "ma_hp",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ten_hp"),
        field: "ten_hp",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.mssv"),
        field: "mssv",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.sinh_vien"),
        field: "sinh_vien",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ten_de_tai"),
        field: "ten_de_tai",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.noi_dung"),
        field: "noi_dung",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.cac_moc_quan_trong"),
        field: "cac_moc_quan_trong",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.giao_vien_hd"),
        field: "giao_vien_hb",
        filter: "agTextColumnFilter"
      },
      {
        headerName: "Giáo viên phản biện",
        field: "giao_vien_pb",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.action"),
        field: "action",
        pinned: "right",
        width: 150,
        cellRenderer: ActionCellRender,
        filter: false
      }
    ]);
  }, [kiHoc]);
  return (
    <>
      <PageContainer title="Danh sách sinh viên phản biện">
        <BaseTable
          columns={columnDefs}
          api={thuctapApi.listPhanBienPage}
          gridOption={{ defaultColDef: defaultColDef }}
          key={keyRender}
        ></BaseTable>
      </PageContainer>
    </>
  );
};
const DoAnPageMobile: FC<{ setKeyRender: any }> = () => {
  const [dataSource, setDataSource] = useState<SinhVienPhanBien[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
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
      const res = await thuctapApi.listPhanBienPage(filter);
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
        ma: {
          filterType: "text",
          type: "contains",
          filter: filter.ma
        },
        ma_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_hp
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
        },
        mssv: {
          filterType: "text",
          type: "contains",
          filter: filter.mssv
        },
        sinh_vien: {
          filterType: "text",
          type: "contains",
          filter: filter.sinh_vien
        },
        giao_vien: {
          filterType: "text",
          type: "contains",
          filter: filter.giao_vien
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ten_de_tai) {
      sendData.filterModel.ten_de_tai = {
        filterType: "text",
        type: "contains",
        filter: filter.ten_de_tai
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
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã lớp">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hp" label="Mã học phần">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_hp" label="Tên học phần">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="mssv" label="Mã sinh viên">
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_de_tai" label="Tên đề tài">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_de_tai", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="giao_vien" label="Giáo viên hướng dẫn">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("giao_vien", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có đồ án nào</div>;
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
                  <strong>Mã lớp học:</strong> {record.ma}
                </p>
                <p className="my-1">
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Mã sinh viên:</strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>Tên sinh viên:</strong> {record.sinh_vien}
                </p>
                <p className="my-1">
                  <strong>Tên đề tài:</strong> {record.ten_de_tai}
                </p>
                <p className="my-1">
                  <strong>Nội dung đề tài:</strong> {record.noi_dung}
                </p>
                <p className="my-1">
                  <strong>Các mốc kiểm soát chính:</strong> {record.cac_moc_quan_trong}
                </p>
                <p className="my-1">
                  <strong>Giáo viên hướng dẫn:</strong> {record.giao_vien_hd}
                </p>
                <p className="my-1">
                  <strong>Giáo viên phản biện:</strong> {record.giao_vien_pb}
                </p>

                <div className="flex justify-center">
                  <Tooltip title="Đánh giá">
                    <Link to={`/sohoa/tro-ly/danh-sach-phan-bien/${record.lop_id}/${record.sinh_vien_id}/danh-gia`}>
                      <Button shape="circle" icon={<InfoCircleOutlined />} type="text" />
                    </Link>
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
      </>
    );
  }

  return (
    <PageContainer title="Danh sách sinh viên phản biện">
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </PageContainer>
  );
};
const ActionCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Đánh giá">
        <Link to={`/sohoa/tro-ly/danh-sach-phan-bien/${data.lop_id}/${data.sinh_vien_id}/danh-gia`}>
          <Button shape="circle" icon={<InfoCircleOutlined />} type="text" />
        </Link>
      </Tooltip>
    </>
  );
};
