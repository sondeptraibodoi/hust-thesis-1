import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Spin,
  Tag,
  Tooltip,
  notification
} from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import kiHocApi from "@/api/kiHoc/kiHoc.api";
import nhiemVuApi from "@/api/nhiemVu/nhiemVu.api";
import phucKhaoApi from "@/api/phucKhao/phucKhao.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import ColorButton from "@/components/Button";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { NhiemVu } from "@/interface/user";
import PageContainer from "@/Layout/PageContainer";
import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { formatDate } from "@/utils/formatDate";
import { ColDef } from "ag-grid-community";
import Title from "antd/es/typography/Title";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";
import { Link } from "react-router-dom";

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
const statusoption = [
  {
    value: "da_giao",
    label: "Đã giao"
  },
  {
    value: "da_lam",
    label: "Đã làm"
  },
  {
    value: "qua_han",
    label: "Quá hạn"
  }
];

const NhiemVuPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <NhiemVuPageDesktop />;
  const contentMobile = () => <NhiemVuPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default NhiemVuPage;

const NhiemVuPageDesktop: FC<any> = () => {
  const { t } = useTranslation(["nhiem-vu", "phuc-khao"]);
  const [data, setData] = useState<NhiemVu>();
  const [giaoViens, setGiaoViens] = useState([]);
  const [keyRender, setKeyRender] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [isShowModalForm, setShowModalForm] = useState(false);
  const [form] = Form.useForm();
  const [isModalResult, setIsModalResult] = useState(false);
  const [dataEdit, setDataEdit] = useState<any>();
  const [api, contextHolder] = notification.useNotification();
  const [keyPhucKhaoRender, setKeyPhucKhaoRender] = useState(0);

  const kiHienGio = useAppSelector(getKiHienGio);
  const [filter, setFilter] = useState<any>();

  const [phucKhaoColumnDefs] = useState<ColDef[]>([
    {
      headerName: t("field.mssv", { ns: "phuc-khao" }),
      field: "mssv",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ki_hoc", { ns: "phuc-khao" }),
      field: "ki_hoc",
      filter: "agTextColumnFilter"
    },
    {
      headerName: "Mã học phần",
      field: "ma_hp",
      sortable: true
    },
    {
      headerName: t("field.ma_lop", { ns: "phuc-khao" }),
      field: "ma_lop_hoc",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_lop_thi", { ns: "phuc-khao" }),
      field: "ma_lop_thi",
      filter: "agTextColumnFilter"
    },
    {
      headerName: "Điểm",
      field: "diem",
      filter: false
    }
  ]);
  const [columnDefs] = useState<ColDef<NhiemVu & ActionField>[]>([
    {
      headerName: t("field.tieu_de"),
      field: "tieu_de",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.nguoi_tao"),
      field: "nguoi_tao",
      filter: "agTextColumnFilter"
    },

    {
      headerName: t("field.nguoi_lam"),
      field: "nguoi_lam",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ngay_het_hieu_luc"),
      field: "ngay_het_hieu_luc",
      filter: false,
      cellRenderer: (x: any) => {
        return formatDate(x.value);
      }
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai2",
      filter: SelectFilter,
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Trạng thái",
        data: statusoption
      },
      cellRenderer: (x: any) => {
        if (x.value == "da_giao") {
          return <Tag>Đã giao</Tag>;
        }
        if (x.value == "qua_han") {
          return <Tag color="error">Quá hạn</Tag>;
        }
        if (x.value == "da_lam") {
          return <Tag color="#87d068">Đã làm</Tag>;
        }
        if (x.value == "lam_qua_han") {
          return <Tag color="warning">Làm sau hạn</Tag>;
        }
        return <Tag>{x.value}</Tag>;
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 100,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onDeleteItem: (item: NhiemVu) => {
          setData(item);
          setIsModalDelete(true);
        },
        onUpdateItem: (item: any) => {
          setIsEdit(true);
          setShowModalForm(true);
          setDataEdit(item);
          let context: any = item.noi_dung;
          if (typeof context === "string") {
            context = JSON.parse(context);
          }
          form.setFieldsValue({
            ...item,
            ngay_het_hieu_luc: dayjs(item.ngay_het_hieu_luc),
            ngay_ket_thuc_phuc_khao: context.ngay_ket_thuc_phuc_khao
              ? dayjs(context.ngay_ket_thuc_phuc_khao)
              : undefined,
            ngay_bat_dau_phuc_khao: context.ngay_bat_dau_phuc_khao ? dayjs(context.ngay_bat_dau_phuc_khao) : undefined,
            ki_hoc: context.ki_hoc,
            nguoi_lam_id: context.nguoi_lam_id,
            ma_hoc_phan: context.ma_hoc_phan
          });
        }
      },
      filter: false
    }
  ]);
  useEffect(() => {
    const getGiaoViens = async () => {
      const response = await nhiemVuApi.listGiaoViens();
      setGiaoViens(response.data);
    };
    getGiaoViens();
  }, []);
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
  const cancel = () => {
    form.resetFields();
    setShowModalForm(false);
    setFilter({});
    setDataEdit(undefined);
  };
  const cancelModalResult = () => {
    setIsModalResult(false);
  };
  const onCreateItem = () => {
    setIsEdit(false);
    setShowModalForm(true);
    form.resetFields();
    form.setFieldsValue({ ki_hoc: kiHienGio });
  };
  const onFinish = (value: any) => {
    const date_limit = dayjs(value.ngay_het_hieu_luc).format("YYYY-MM-DD").toString();
    const date_start = dayjs(value.ngay_bat_dau_phuc_khao).format("YYYY-MM-DD").toString();
    const date_end = dayjs(value.ngay_ket_thuc_phuc_khao).format("YYYY-MM-DD").toString();
    value.ngay_het_hieu_luc = date_limit;
    value.ngay_bat_dau_phuc_khao = date_start;
    value.ngay_ket_thuc_phuc_khao = date_end;

    const createNhiemVu = async (params: any) => {
      setLoading(true);
      try {
        await nhiemVuApi.create(params);
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        setShowModalForm(false);
        setKeyRender(Math.random());
      } catch (error: any) {
        api.error({
          message: t("message.error_add"),
          description: error.response.data.message ? error.response.data.message : t("message.error_desc_add")
        });
      } finally {
        setLoading(false);
      }
    };
    const updateNhiemVu = async (params: any) => {
      setLoading(true);
      try {
        await nhiemVuApi.update({ ...dataEdit, ...params });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        setIsEdit(false);
        setDataEdit(undefined);
        setShowModalForm(false);
      } catch (error: any) {
        api.error({
          message: t("message.error_edit"),
          description: error.response.data.message ? error.response.data.message : t("message.error_desc_edit")
        });
      } finally {
        setKeyRender(Math.random());
        setLoading(false);
      }
    };
    isEdit ? updateNhiemVu(value) : createNhiemVu(value);
  };

  const handleShowResult = () => {
    setIsModalResult(true);
    const value = form.getFieldsValue();
    const date_start = dayjs(value.ngay_bat_dau_phuc_khao).format("YYYY-MM-DD").toString();
    const date_end = dayjs(value.ngay_ket_thuc_phuc_khao).format("YYYY-MM-DD").toString();
    setFilter({
      ma_thanh_toan: "da_thanh_toan",
      ki_hoc: value.ki_hoc,
      ma_hoc_phan: value.ma_hoc_phan,
      ngay_ket_thuc_phuc_khao: date_end,
      ngay_bat_dau_phuc_khao: date_start
    });
    setKeyPhucKhaoRender((state) => {
      return ++state;
    });
  };

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <>
      {contextHolder}
      <PageContainer
        title="Quản lý nhiệm vụ"
        extraTitle={
          <Button onClick={onCreateItem} type="primary" style={{ float: "right" }}>
            {t("action.create_new")}
          </Button>
        }
      >
        <BaseTable
          key={keyRender}
          columns={columnDefs}
          api={nhiemVuApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
          cacheName={"/tableFilter"}
        ></BaseTable>
      </PageContainer>
      <Modal open={isShowModalForm} onCancel={cancel} footer={<></>} width={570}>
        <div className="model-container phuc-khao-container">
          <div className="model-icon create-icon">
            <div>{<SiMicrosoftexcel />}</div>
          </div>

          <div className="">
            <Title level={4}>{isEdit ? "Chỉnh sửa" : "Thêm mới"}</Title>
            <p>{isEdit ? t("sub_title.edit") : t("sub_title.create_new")}</p>
          </div>
          <Form className="base-form flex-grow-1" form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="tieu_de"
              initialValue={"Nhiệm vụ phúc khảo"}
              label={t("field.tieu_de")}
              rules={[{ required: true, message: t("required.nguoi_lam") }]}
            >
              <Input placeholder={t("field.tieu_de")} autoFocus />
            </Form.Item>
            <Form.Item
              name="ki_hoc"
              label={t("field.ki_hoc")}
              rules={[{ required: true, message: t("required.ki_hoc") }]}
            >
              <Select
                showSearch
                placeholder={t("field.ki_hoc")}
                optionFilterProp="children"
                filterOption={filterOption}
                options={kiHoc.map((item: any) => {
                  return { value: item, label: item };
                })}
              />
            </Form.Item>
            <Form.Item
              name="nguoi_lam_id"
              label={t("field.nguoi_lam")}
              className="select-lop-thi"
              rules={[{ required: true, message: t("required.nguoi_lam") }]}
            >
              <Select
                showSearch
                placeholder={t("field.nguoi_lam")}
                optionFilterProp="children"
                filterOption={filterOption}
              >
                {renderOption(giaoViens)}
              </Select>
            </Form.Item>
            <Form.Item
              name="ma_hoc_phan"
              label={t("field.ma_hoc_phan")}
              rules={[{ required: true, message: t("required.ma_hoc_phan") }]}
            >
              <Input placeholder={t("field.ma_hoc_phan")} />
            </Form.Item>

            <Form.Item
              name="ngay_het_hieu_luc"
              label={t("field.ngay_het_hieu_luc")}
              rules={[
                {
                  required: true,
                  message: t("required.ngay_het_hieu_luc")
                }
              ]}
            >
              <DatePicker placeholder={t("field.ngay_het_hieu_luc")} format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item
              name="ngay_bat_dau_phuc_khao"
              label={t("field.ngay_bat_dau_phuc_khao")}
              rules={[
                {
                  required: true,
                  message: t("required.ngay_bat_dau_phuc_khao")
                }
              ]}
            >
              <DatePicker placeholder={t("field.ngay_bat_dau_phuc_khao")} format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item
              name="ngay_ket_thuc_phuc_khao"
              label={t("field.ngay_ket_thuc_phuc_khao")}
              rules={[
                {
                  required: true,
                  message: t("required.ngay_ket_thuc_phuc_khao")
                }
              ]}
            >
              <DatePicker placeholder={t("field.ngay_ket_thuc_phuc_khao")} format="DD/MM/YYYY" className="w-full" />
            </Form.Item>

            <Form.Item>
              <Button onClick={handleShowResult}>Xem danh sách phúc khảo cần làm</Button>
            </Form.Item>
            <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
              <div className="flex justify-between gap-4">
                <ColorButton block onClick={cancel}>
                  {t("action.cancel")}
                </ColorButton>
                <ColorButton block htmlType="submit" loading={loading} type="primary">
                  {t("action.accept")}
                </ColorButton>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <DeleteDialog
        openModal={isModalDelete}
        translation="nhiem-vu"
        closeModal={setIsModalDelete}
        name={data?.tieu_de}
        apiDelete={() => data && nhiemVuApi.delete(data)}
        setKeyRender={setKeyRender}
      />
      <Modal open={isModalResult} width={1000} onCancel={cancelModalResult} footer={<></>}>
        <PageContainer title="Danh sách phúc khảo">
          <BaseTable
            key={keyPhucKhaoRender}
            columns={phucKhaoColumnDefs}
            api={phucKhaoApi.listNhiemVu}
            defaultParams={filter}
          ></BaseTable>
        </PageContainer>
      </Modal>
    </>
  );
};
const NhiemVuPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<NhiemVu[]>([]);
  const [data, setData] = useState<NhiemVu>();
  const [isEdit, setIsEdit] = useState(false);
  const [api] = notification.useNotification();
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [isShowModalForm, setShowModalForm] = useState(false);
  const [dataEdit, setDataEdit] = useState<any>();
  const [giaoViens, setGiaoViens] = useState([]);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [isModalResult, setIsModalResult] = useState(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [filter, setFilter] = useState<any>();
  const [keyPhucKhaoRender, setKeyPhucKhaoRender] = useState(0);

  const { t } = useTranslation(["nhiem-vu", "phuc-khao"]);

  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
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
  const [phucKhaoColumnDefs] = useState<ColDef[]>([
    {
      headerName: t("field.mssv", { ns: "phuc-khao" }),
      field: "mssv",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ki_hoc", { ns: "phuc-khao" }),
      field: "ki_hoc",
      filter: "agTextColumnFilter"
    },
    {
      headerName: "Mã học phần",
      field: "ma_hp",
      sortable: true
    },
    {
      headerName: t("field.ma_lop", { ns: "phuc-khao" }),
      field: "ma_lop_hoc",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_lop_thi", { ns: "phuc-khao" }),
      field: "ma_lop_thi",
      filter: "agTextColumnFilter"
    },
    {
      headerName: "Điểm",
      field: "diem",
      filter: false
    }
  ]);
  useEffect(() => {
    const getGiaoViens = async () => {
      const response = await nhiemVuApi.listGiaoViens();
      setGiaoViens(response.data);
    };
    getGiaoViens();
  }, []);
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
  const cancel = () => {
    form.resetFields();
    setShowModalForm(false);
    setFilter({});
    setDataEdit(undefined);
  };
  const cancelModalResult = () => {
    setIsModalResult(false);
  };
  const onCreateItem = () => {
    setIsEdit(false);
    setShowModalForm(true);
    form.resetFields();
    form.setFieldsValue({ ki_hoc: kiHienGio });
  };
  const onFinish = (value: any) => {
    const date_limit = dayjs(value.ngay_het_hieu_luc).format("YYYY-MM-DD").toString();
    const date_start = dayjs(value.ngay_bat_dau_phuc_khao).format("YYYY-MM-DD").toString();
    const date_end = dayjs(value.ngay_ket_thuc_phuc_khao).format("YYYY-MM-DD").toString();
    value.ngay_het_hieu_luc = date_limit;
    value.ngay_bat_dau_phuc_khao = date_start;
    value.ngay_ket_thuc_phuc_khao = date_end;

    const createNhiemVu = async (params: any) => {
      setLoading(true);
      try {
        await nhiemVuApi.create(params);
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        setShowModalForm(false);
        setKeyRender(Math.random());
      } catch (error: any) {
        api.error({
          message: t("message.error_add"),
          description: error.response.data.message ? error.response.data.message : t("message.error_desc_add")
        });
      } finally {
        setLoading(false);
      }
    };
    const updateNhiemVu = async (params: any) => {
      setLoading(true);
      try {
        await nhiemVuApi.update({ ...dataEdit, ...params });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        setIsEdit(false);
        setDataEdit(undefined);
        setShowModalForm(false);
      } catch (error: any) {
        api.error({
          message: t("message.error_edit"),
          description: error.response.data.message ? error.response.data.message : t("message.error_desc_edit")
        });
      } finally {
        setKeyRender(Math.random());
        setLoading(false);
      }
    };
    isEdit ? updateNhiemVu(value) : createNhiemVu(value);
  };

  const handleShowResult = () => {
    setIsModalResult(true);
    const value = form.getFieldsValue();
    const date_start = dayjs(value.ngay_bat_dau_phuc_khao).format("YYYY-MM-DD").toString();
    const date_end = dayjs(value.ngay_ket_thuc_phuc_khao).format("YYYY-MM-DD").toString();
    setFilter({
      ma_thanh_toan: "da_thanh_toan",
      ki_hoc: value.ki_hoc,
      ma_hoc_phan: value.ma_hoc_phan,
      ngay_ket_thuc_phuc_khao: date_end,
      ngay_bat_dau_phuc_khao: date_start
    });
    setKeyPhucKhaoRender((state) => ++state);
  };

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await nhiemVuApi.list(filter);
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
    form2.setFieldsValue({ [field]: value });
    onSubmit(form2.getFieldsValue());
  };
  const onSubmit = (filter?: any) => {
    const sendData: any = {
      filterModel: {
        tieu_de: {
          filterType: "text",
          type: "contains",
          filter: filter.tieu_de
        },
        nguoi_tao: {
          filterType: "text",
          type: "contains",
          filter: filter.nguoi_tao
        },
        nguoi_lam: {
          filterType: "text",
          type: "contains",
          filter: filter.nguoi_lam
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.trang_thai) {
      sendData.filterModel.trang_thai = {
        filterType: "text",
        type: "contains",
        filter: filter.trang_thai
      };
    }
    if (filter.ngay_het_hieu_luc) {
      sendData.filterModel.ngay_het_hieu_luc = {
        dateFrom: filter.ngay_het_hieu_luc,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
    getData(sendData);
  };

  useEffect(() => {
    onSubmit(form2.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form form={form2} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="nguoi_tao" label="Người tạo">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("nguoi_tao", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="nguoi_lam" label="Người được giao">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("nguoi_lam", e.target.value);
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="ngay_het_hieu_luc"
            label="Ngày hết hiệu lực"
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ngay_het_hieu_luc", date);
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
    Content = <div className="p-2 text-center"> Chưa có nhiệm vụ nào</div>;
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
                  <strong>Tiêu đề:</strong> {record.tieu_de}
                </p>
                <p className="my-1">
                  <strong>Người tạo:</strong> {record.nguoi_tao}
                </p>
                <p className="my-1">
                  <strong>Người được giao: </strong>
                  {record.nguoi_lam}
                </p>
                <p className="my-1">
                  <strong>Ngày hết hiệu lực: </strong>
                  {formatDate(record.ngay_het_hieu_luc)}
                </p>
                <p className="my-1">
                  <strong>Trạng thái: </strong>
                  {record.trang_thai === "da_giao" ? (
                    <Tag>Đã giao</Tag>
                  ) : record.trang_thai === "qua_han" ? (
                    <Tag color="red">Quá hạn</Tag>
                  ) : record.trang_thai === "da_lam" ? (
                    <Tag color="#87d068">Đã làm</Tag>
                  ) : (
                    <Tag>{record.trang_thai}</Tag>
                  )}
                </p>

                <div className="flex justify-center">
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setIsEdit(true);
                        setShowModalForm(true);
                        setDataEdit(record);
                        let context: any = record.noi_dung;
                        if (typeof context === "string") {
                          context = JSON.parse(context);
                        }
                        form.setFieldsValue({
                          ...record,
                          ngay_het_hieu_luc: dayjs(record.ngay_het_hieu_luc),
                          ngay_ket_thuc_phuc_khao: context.ngay_ket_thuc_phuc_khao
                            ? dayjs(context.ngay_ket_thuc_phuc_khao)
                            : undefined,
                          ngay_bat_dau_phuc_khao: context.ngay_bat_dau_phuc_khao
                            ? dayjs(context.ngay_bat_dau_phuc_khao)
                            : undefined,
                          ki_hoc: context.ki_hoc,
                          nguoi_lam_id: context.nguoi_lam_id,
                          ma_hoc_phan: context.ma_hoc_phan
                        });
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
        <Modal open={isShowModalForm} onCancel={cancel} footer={<></>} width={570}>
          <div className="model-container phuc-khao-container">
            <div className="model-icon create-icon">
              <div>{<SiMicrosoftexcel />}</div>
            </div>

            <div className="">
              <Title level={4}>{isEdit ? "Chỉnh sửa" : "Thêm mới"}</Title>
              <p>{isEdit ? t("sub_title.edit") : t("sub_title.create_new")}</p>
            </div>
            <Form className="base-form flex-grow-1" form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="tieu_de"
                initialValue={"Nhiệm vụ phúc khảo"}
                label={t("field.tieu_de")}
                rules={[{ required: true, message: t("required.nguoi_lam") }]}
              >
                <Input placeholder={t("field.tieu_de")} autoFocus />
              </Form.Item>
              <Form.Item
                name="ki_hoc"
                label={t("field.ki_hoc")}
                rules={[{ required: true, message: t("required.ki_hoc") }]}
              >
                <Select
                  showSearch
                  placeholder={t("field.ki_hoc")}
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={kiHoc.map((item: any) => {
                    return { value: item, label: item };
                  })}
                />
              </Form.Item>
              <Form.Item
                name="nguoi_lam_id"
                label={t("field.nguoi_lam")}
                className="select-lop-thi"
                rules={[{ required: true, message: t("required.nguoi_lam") }]}
              >
                <Select
                  showSearch
                  placeholder={t("field.nguoi_lam")}
                  optionFilterProp="children"
                  filterOption={filterOption}
                >
                  {renderOption(giaoViens)}
                </Select>
              </Form.Item>
              <Form.Item
                name="ma_hoc_phan"
                label={t("field.ma_hoc_phan")}
                rules={[{ required: true, message: t("required.ma_hoc_phan") }]}
              >
                <Input placeholder={t("field.ma_hoc_phan")} />
              </Form.Item>

              <Form.Item
                name="ngay_het_hieu_luc"
                label={t("field.ngay_het_hieu_luc")}
                rules={[
                  {
                    required: true,
                    message: t("required.ngay_het_hieu_luc")
                  }
                ]}
              >
                <DatePicker placeholder={t("field.ngay_het_hieu_luc")} format="DD/MM/YYYY" className="w-full" />
              </Form.Item>
              <Form.Item
                name="ngay_bat_dau_phuc_khao"
                label={t("field.ngay_bat_dau_phuc_khao")}
                rules={[
                  {
                    required: true,
                    message: t("required.ngay_bat_dau_phuc_khao")
                  }
                ]}
              >
                <DatePicker placeholder={t("field.ngay_bat_dau_phuc_khao")} format="DD/MM/YYYY" className="w-full" />
              </Form.Item>
              <Form.Item
                name="ngay_ket_thuc_phuc_khao"
                label={t("field.ngay_ket_thuc_phuc_khao")}
                rules={[
                  {
                    required: true,
                    message: t("required.ngay_ket_thuc_phuc_khao")
                  }
                ]}
              >
                <DatePicker placeholder={t("field.ngay_ket_thuc_phuc_khao")} format="DD/MM/YYYY" className="w-full" />
              </Form.Item>

              <Form.Item>
                <Button onClick={handleShowResult}>Xem danh sách phúc khảo cần làm</Button>
              </Form.Item>
              <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
                <div className="flex justify-between gap-4">
                  <ColorButton block onClick={cancel}>
                    {t("action.cancel")}
                  </ColorButton>
                  <ColorButton block htmlType="submit" loading={loading} type="primary">
                    {t("action.accept")}
                  </ColorButton>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <DeleteDialog
          openModal={isModalDelete}
          translation="nhiem-vu"
          closeModal={setIsModalDelete}
          name={data?.tieu_de}
          apiDelete={() => data && nhiemVuApi.delete(data)}
          setKeyRender={setKeyRender}
        />
        <Modal open={isModalResult} width={1000} onCancel={cancelModalResult} footer={<></>}>
          <PageContainer title="Danh sách phúc khảo">
            <BaseTable
              key={keyPhucKhaoRender}
              columns={phucKhaoColumnDefs}
              api={phucKhaoApi.listNhiemVu}
              defaultParams={filter}
            ></BaseTable>
          </PageContainer>
        </Modal>
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý nhiệm vụ"
        extraTitle={
          <Button onClick={onCreateItem} type="primary" style={{ float: "right" }}>
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

const ActionCellRender: FC<any> = ({ onDeleteItem, data, onUpdateItem }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Cập nhật">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Chi tiết">
        <Link to={"./" + data.id}>
          <Button shape="circle" type="text">
            <i className="fa-solid fa-chevron-right"></i>
          </Button>
        </Link>
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};

const renderOption = (data: any) => {
  if (!Array.isArray(data)) return <></>;
  if (!data || !data.length) return <></>;

  return (
    <>
      {data.map((item, index) => (
        <Select.Option key={index} value={item.id} label={`${item.name} (${item.email})`}>
          {item.name} - {item.email}
        </Select.Option>
      ))}
    </>
  );
};
