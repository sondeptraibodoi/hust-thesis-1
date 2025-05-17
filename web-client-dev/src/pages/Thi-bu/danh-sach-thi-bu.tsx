import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Tag, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import exportApi from "@/api/export/export.api";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import troLyApi from "@/api/thiBu/troLy.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import EditDialog from "@/components/editDialog";
import ModalExportThiBu from "@/components/export/export-excel-thiBu";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { troLyThiBu } from "@/interface/thiBu";
import PageContainer from "@/Layout/PageContainer";
import { useAppSelector } from "@/stores/hook";
import { EditOutlined } from "@ant-design/icons";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const statusoption = [
  {
    value: "da_duyet",
    label: "Đã duyệt"
  },
  {
    value: "khong_duyet",
    label: "Không duyệt"
  },
  {
    value: "chua_xac_nhan",
    label: "Chưa xác nhận"
  }
];
const DanhSachThiBuPages = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <DanhSachThiBuPageDesktop />;
  const contentMobile = () => <DanhSachThiBuPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default DanhSachThiBuPages;

const DanhSachThiBuPageDesktop: FC<any> = () => {
  const { t } = useTranslation("sinh-vien-thi-bu");
  const [columnDefs, setColumDefs] = useState<ColDef<troLyThiBu & ActionField>[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [modalExportThiBu, setModalExportThiBu] = useState(false);
  const [data, setData] = useState<troLyThiBu>();
  const { items: dotThi, format: formatDotThi } = useLoaiLopThi();
  const [kiHoc, setKihoc] = useState<string[]>([]);

  const optionsEdit = [
    {
      type: "input",
      name: "ki_hoc",
      placeholder: t("field.ki_hoc"),
      label: t("field.ki_hoc"),
      disabled: true
    },
    {
      type: "input",
      name: "name",
      placeholder: t("field.name"),
      label: t("field.name"),
      disabled: true
    },
    {
      type: "input",
      name: "ten_hp",
      placeholder: t("field.ten_hp"),
      label: t("field.ten_hp"),
      disabled: true
    },
    {
      type: "select",
      name: "dot_thi",
      placeholder: t("field.dot_thi"),
      label: t("field.dot_thi"),
      disabled: true,
      children: dotThi
    },
    {
      type: "textarea",
      name: "ly_do",
      placeholder: t("field.ly_do"),
      label: t("field.ly_do"),
      disabled: true
    },
    {
      type: "textarea",
      name: "phan_hoi",
      placeholder: t("field.phan_hoi"),
      label: t("field.phan_hoi")
      // disabled: true
    },
    {
      type: "select",
      name: "trang_thai",
      placeholder: t("field.trang_thai"),
      label: t("field.trang_thai"),
      children: [
        { value: "da_duyet", title: "Duyệt" },
        { value: "khong_duyet", title: "Không duyệt" },
        { value: "chua_xac_nhan", title: "Chưa xác nhận" }
      ]
    },
    {
      type: "dragger",
      name: "image_urls",
      placeholder: "Chọn ảnh",
      label: "Chọn ảnh",
      url: data?.image_urls,
      disabled: true
    }
  ];

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
        placeholder: t("field.ki_hoc"),
        data: kiHoc.map((x: any) => ({ value: x, label: x }))
      };
    }

    const loai_columns: ColDef = {
      headerName: t("field.dot_thi"),
      field: "dot_thi",
      filter: SelectFilter,
      floatingFilter: true,
      cellRenderer: loaiCellRenderer
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
      ki_hoc_columns,
      {
        headerName: t("field.name"),
        field: "name",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ten_hp"),
        field: "ten_hp",
        filter: "agTextColumnFilter"
      },

      loai_columns,
      {
        headerName: t("field.ly_do"),
        field: "ly_do",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.phan_hoi"),
        field: "phan_hoi",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.trang_thai"),
        field: "trang_thai",
        filter: SelectFilter,
        floatingFilter: true,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: t("field.trang_thai"),
          data: statusoption
        },
        cellRenderer: (params: any) => {
          if (!params.value) {
            return <span></span>;
          }
          return params.value === "da_duyet" ? (
            <Tag color="success">Đã duyệt</Tag>
          ) : params.value === "khong_duyet" ? (
            <Tag color="error">Không duyệt</Tag>
          ) : (
            <Tag>Chưa xác nhận</Tag>
          );
        }
      },
      {
        headerName: t("field.action"),
        field: "action",
        width: 200,
        cellRenderer: ActionCellRender,
        cellRendererParams: {
          onUpdateStatus: (item: any) => {
            setData(item);
            setIsEdit(true);
          }
        },
        filter: false
      }
    ]);
  }, [kiHoc, t]);
  return (
    <>
      <PageContainer
        title="Danh sách đơn đăng ký thi bù"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button onClick={() => setModalExportThiBu(true)} type="primary">
              Xuất danh sách
            </Button>
          </Space>
        }
      >
        <BaseTable
          key={keyRender}
          columns={columnDefs}
          api={troLyApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <EditDialog
        apiEdit={troLyApi.edit}
        openModal={isEdit}
        closeModal={setIsEdit}
        setKeyRender={setKeyRender}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        translation="sinh-vien-thi-bu"
        options={optionsEdit}
        data={data}
        btnEdit="Sửa"
      />
      <ModalExportThiBu
        translation="sinh-vien-thi-bu"
        showModal={modalExportThiBu}
        setShowModal={setModalExportThiBu}
        api={exportApi.excelThiBu}
        data={data}
        text="danh-sach-thi-bu"
      />
    </>
  );
};
const DanhSachThiBuPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<troLyThiBu[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [data, setData] = useState<troLyThiBu>();
  const [modalExportThiBu, setModalExportThiBu] = useState(false);
  const { items: dotThi, format: formatDotThi } = useLoaiLopThi();

  const [form] = Form.useForm();
  const { t } = useTranslation("sinh-vien-thi-bu");

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
  const optionsEdit = [
    {
      type: "input",
      name: "ki_hoc",
      placeholder: t("field.ki_hoc"),
      label: t("field.ki_hoc"),
      disabled: true
    },
    {
      type: "input",
      name: "name",
      placeholder: t("field.name"),
      label: t("field.name"),
      disabled: true
    },
    {
      type: "input",
      name: "ten_hp",
      placeholder: t("field.ten_hp"),
      label: t("field.ten_hp"),
      disabled: true
    },
    {
      type: "select",
      name: "dot_thi",
      placeholder: t("field.dot_thi"),
      label: t("field.dot_thi"),
      disabled: true,
      children: dotThi
    },
    {
      type: "textarea",
      name: "ly_do",
      placeholder: t("field.ly_do"),
      label: t("field.ly_do"),
      disabled: true
    },
    {
      type: "textarea",
      name: "phan_hoi",
      placeholder: t("field.phan_hoi"),
      label: t("field.phan_hoi")
      // disabled: true
    },
    {
      type: "select",
      name: "trang_thai",
      placeholder: t("field.trang_thai"),
      label: t("field.trang_thai"),
      children: [
        { value: "da_duyet", title: "Duyệt" },
        { value: "khong_duyet", title: "Không duyệt" },
        { value: "chua_xac_nhan", title: "Chưa xác nhận" }
      ]
    },
    {
      type: "dragger",
      name: "image_urls",
      placeholder: "Chọn ảnh",
      label: "Chọn ảnh",
      url: data?.image_urls,
      disabled: true
    }
  ];

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await troLyApi.list({ ...filter, with: "giaoViens" });
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
        name: {
          filterType: "text",
          type: "contains",
          filter: filter.name
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
        },
        dot_thi: {
          filterType: "text",
          type: "contains",
          filter: filter.dot_thi
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
    if (filter.ma_kem) {
      sendData.filterModel.ma_kem = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_kem
      };
    }
    if (filter.giaoViens) {
      sendData.filterModel.giaoViens = {
        filterType: "relationship",
        type: "contains",
        relationship: "giaoViens",
        filter: filter.giaoViens
      };
    }
    if (filter.is_dai_cuong) {
      sendData.filterModel.is_dai_cuong = {
        filterType: "text",
        type: "contains",
        filter: filter.is_dai_cuong
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_hp" label="Tên học phần ">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
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
              {dotThi.map((item) => (
                <Select.Option key={item.value}>{item.title}</Select.Option>
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
    Content = <div className="p-2 text-center"> Chưa có đơn thi bù nào</div>;
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
                  <strong>Tên sinh viên:</strong> {record.name}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Đợt thi:</strong> {formatDotThi(record.dot_thi)}
                </p>
                <p className="my-1">
                  <strong>Lý do:</strong> {record.ly_do}
                </p>
                <p className="my-1">
                  <strong>Phản hồi:</strong> {record.phan_hoi}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong>{" "}
                  {record.trang_thai === "da_duyet" ? (
                    <Tag color="success">Đã duyệt</Tag>
                  ) : record.trang_thai === "khong_duyet" ? (
                    <Tag color="error">Không duyệt</Tag>
                  ) : (
                    <Tag>Chưa xác nhận</Tag>
                  )}
                </p>

                <div className="flex justify-center">
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setData(record);
                        setIsEdit(true);
                      }}
                    ></Button>
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
        <EditDialog
          apiEdit={troLyApi.edit}
          openModal={isEdit}
          closeModal={setIsEdit}
          setKeyRender={setKeyRender}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          translation="sinh-vien-thi-bu"
          options={optionsEdit}
          data={data}
          btnEdit="Sửa"
        />
        <ModalExportThiBu
          translation="sinh-vien-thi-bu"
          showModal={modalExportThiBu}
          setShowModal={setModalExportThiBu}
          api={exportApi.excelThiBu}
          data={data}
          text="danh-sach-thi-bu"
        />
      </>
    );
  }

  return (
    <PageContainer
      title="Danh sách đơn đăng ký thi bù"
      extraTitle={
        <Space style={{ float: "right" }}>
          <Button onClick={() => setModalExportThiBu(true)} type="primary">
            Xuất danh sách
          </Button>
        </Space>
      }
    >
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </PageContainer>
  );
};
const ActionCellRender: FC<{ data: troLyThiBu; onUpdateStatus: any }> = ({ data, onUpdateStatus }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateStatus(data)}></Button>
      </Tooltip>
    </>
  );
};
export interface LoaiCellRendererParams extends ICellRendererParams {
  format: (value: string) => string;
}
const loaiCellRenderer: FC<LoaiCellRendererParams> = (params) => {
  if (!params.value || typeof params.format !== "function") {
    return "";
  }
  return params.format(params.value);
};
