import { FC, useCallback, useEffect, useState } from "react";

import lopHocApi from "@/api/lop/lopCuaGiaoVien.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { useKiHoc } from "@/hooks/useKiHoc";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { Lop } from "@/interface/lop";
import PageContainer from "@/Layout/PageContainer";
import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { ReadOutlined, RightOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LoaiLopThi } from "@/constant";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const LopHocPage = () => {
  const kiHienGio = useAppSelector(getKiHienGio);

  const contentDesktop = () => kiHienGio && <LopHocPageDesktop kiHienGio={kiHienGio} />;
  const contentMobile = () => kiHienGio && <LopHocPageMobile kiHienGio={kiHienGio} />;
  return (
    <>
      <PageContainer title="Danh sách lớp dạy">
        <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
      </PageContainer>
    </>
  );
};

export default LopHocPage;

const LopHocPageDesktop: FC<{ kiHienGio: string }> = ({ kiHienGio }) => {
  const { t } = useTranslation("lop");
  const { getData } = useKiHoc();
  const [columnDefs] = useState<ColDef<Lop & ActionField>[]>([
    {
      headerName: t("field.ki_hoc"),
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
      headerName: t("field.ma"),
      field: "ma",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_kem"),
      field: "ma_kem",
      filter: "agTextColumnFilter"
    },

    {
      headerName: t("field.ma_hp"),
      field: "ma_hp",
      filter: "agTextColumnFilter",
      sortable: true
    },
    {
      headerName: t("field.ten_hp"),
      field: "ten_hp",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.phong"),
      field: "phong",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.loai"),
      field: "loai",
      filter: "agTextColumnFilter"
    },

    {
      headerName: t("field.ghi_chu"),
      field: "ghi_chu",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {},
      filter: false
    }
  ]);
  const [initFilter] = useState({
    ki_hoc: {
      filterType: "text",
      type: "contains",
      filter: kiHienGio
    }
  });
  return (
    <>
      <BaseTable
        columns={columnDefs}
        api={lopHocApi.list}
        initFilter={initFilter}
        gridOption={{ defaultColDef: defaultColDef }}
      ></BaseTable>
    </>
  );
};

const LopHocPageMobile: FC<{
  kiHienGio: string;
}> = ({ kiHienGio }) => {
  const { items: kiHoc } = useKiHoc();
  const [dataSource, setDataSource] = useState<Lop[]>([]);
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
      const res = await lopHocApi.list(filter);
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
        ma: {
          filterType: "text",
          type: "contains",
          filter: filter.ma
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_hp" label="Tên học phần">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có lớp dạy nào</div>;
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
                  <strong>Mã lớp kèm:</strong> {record.ma_kem}
                </p>
                <p className="my-1">
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Phòng:</strong> {record.phong}
                </p>
                <p className="my-1">
                  <strong>Loại:</strong> {record.loai}
                </p>
                <p className="my-1">
                  <strong>Ghi chú:</strong> {record.ghi_chu}
                </p>
                <div className="flex justify-center">
                  <Tooltip title="Chi tiết">
                    <Link to={"" + record.id}>
                      <Button shape="circle" icon={<RightOutlined />} type="text"></Button>
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
    <div>
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </div>
  );
};

const ActionCellRender: FC<{ data: Lop }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Chi tiết">
        <Link to={"" + data.id}>
          <Button shape="circle" icon={<RightOutlined />} type="text"></Button>
        </Link>
      </Tooltip>
      {data.loai_thi == LoaiLopThi.Thi_Theo_Chuong &&
        !!data.hoc_phan_chuongs_count &&
        data.hoc_phan_chuongs_count > 0 && (
          <Tooltip title="Kiểm tra">
            <Link to={"kiem-tra/" + data.id}>
              <Button shape="circle" icon={<ReadOutlined />} type="text"></Button>
            </Link>
          </Tooltip>
        )}
    </>
  );
};
