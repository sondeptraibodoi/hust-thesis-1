import { EditOutlined, PaperClipOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import {
  CauHoiCellRender,
  DoKhoCellRender,
  GiaoVienPhanBienCellRender,
  GiaoVienTaoCellRender,
  LoaiThiCellRender,
  TrangThaiCauHoiCellRender,
  TrangThaiPhanBienCellRender
} from "../../../components/TrangThaiCellRender";

import PageContainer from "@/Layout/PageContainer";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import giaoVienApi from "@/api/user/giaoVien.api";
import { renderMath } from "@/components/TrangThaiCellRender/utils";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { renderOptionGiaoVien } from "@/components/custom-filter/selectFilterGiaoVien";
import { STATUS_QUESTION } from "@/constant";
import { useGiaoVienApi } from "@/hooks/useGiaoVien";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { GiaoVien } from "@/interface/giaoVien";
import { HocPhanCauHoiChuong } from "@/interface/hoc-phan";
import CreatNEditPhanBienDialog from "@/pages/tro-ly-hoc-phan/createNEditPhanBien";
import { ColDef } from "ag-grid-community";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AssignTestTypeDialog from "./dialogAssignTestType";
import ChangeStatusDialog from "./dialogChangeStatus";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const trangThaiCauHoi = [
  {
    value: "moi_tao",
    label: "Mới tạo"
  },
  {
    value: "tu_choi",
    label: "Từ chối"
  },
  {
    value: "cho_duyet_lan_1",
    label: "Chờ duyệt lần 1"
  },
  {
    value: "cho_duyet_lan_2",
    label: "Chờ duyệt lần 2"
  },
  {
    value: "cho_phan_bien",
    label: "Chờ phản biện"
  },
  {
    value: "cho_phan_bien_lan_2",
    label: "Chờ phản biện lần 2"
  },
  {
    value: "dang_su_dung",
    label: "Đang sử dụng"
  },
  {
    value: "can_sua",
    label: "Cần sửa"
  }
];
const trangThaiPhanBien = [
  {
    value: "chua_co",
    label: "Chưa có"
  },
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
const DanhSachCauHoiTroLyPage: FC<any> = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <DanhSachCauHoiTroLyDesktop />;
  const contentMobile = () => <DanhSachCauHoiTroLyMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default DanhSachCauHoiTroLyPage;

const DanhSachCauHoiTroLyDesktop: FC<any> = () => {
  const { items: giaoVien, getData: getDataGiaoVien } = useGiaoVienApi();
  const { t } = useTranslation("danh-sach-cau-hoi");
  const [keyRender, setKeyRender] = useState(0);
  const [cauHoi, setCauHoi] = useState<HocPhanCauHoiChuong[]>([]);
  const [cauHoiSelect, setCauHoiSelect] = useState<HocPhanCauHoiChuong>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [columnDefs] = useState<ColDef<HocPhanCauHoiChuong & ActionField>[]>([
    {
      headerName: t("field.cau_hoi_id"),
      field: "cau_hoi_id",
      filter: "agTextColumnFilter",
      sortable: true
    },
    {
      headerName: t("field.ma_hoc_phan"),
      field: "ma_hoc_phan",
      filter: "agTextColumnFilter",
      sortable: true
    },
    {
      headerName: t("field.chu_de"),
      field: "chuong.ten",
      filter: "agTextColumnFilter",
      sortable: true
    },
    {
      headerName: t("field.is_primary"),
      field: "is_primary",
      sortable: true,
      cellDataType: "boolean",
      cellRenderer: (params: any) => {
        return <Checkbox disabled checked={params.value} />;
      }
    },
    {
      headerName: t("field.do_kho"),
      field: "do_kho",
      sortable: true,
      cellRenderer: (data: any) => {
        return DoKhoCellRender({ data: data?.data?.do_kho });
      },
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: t("field.do_kho"),
        data: doKho
      }
    },
    {
      headerName: t("field.noi_dung"),
      field: "cau_hoi.noi_dung",
      cellRenderer: (data: any) =>
        data?.data?.cau_hoi?.noi_dung && CauHoiCellRender({ data: data?.data?.cau_hoi?.noi_dung }),
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains"],
        suppressAndOrCondition: true,
        defaultOption: "contains"
      }
    },
    {
      headerName: t("field.created_by_id"),
      field: "created_by_id",
      floatingFilter: true,
      cellRenderer: GiaoVienTaoCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: t("field.created_by_id"),
        getData: getDataGiaoVien,
        renderOption: renderOptionGiaoVien
      },
      filter: SelectFilter
    },
    {
      headerName: t("field.trang_thai_cau_hoi"),
      field: "cau_hoi.trang_thai",
      cellRenderer: (data: any) =>
        data?.data?.cau_hoi?.trang_thai && TrangThaiCauHoiCellRender({ data: data?.data?.cau_hoi?.trang_thai }),

      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: t("field.trang_thai_cau_hoi"),
        data: trangThaiCauHoi
      }
    },
    {
      headerName: t("field.giao_vien_phan_bien"),
      field: "giao_vien_phan_bien",
      floatingFilter: true,
      cellRenderer: GiaoVienPhanBienCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: t("field.giao_vien_phan_bien"),
        getData: getDataGiaoVien,
        renderOption: renderOptionGiaoVien
      },
      filter: SelectFilter
    },
    {
      headerName: t("field.trang_thai_phan_bien"),
      field: "trang_thai_phan_bien",
      cellRenderer: (data: any) =>
        data?.data?.cau_hoi?.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi &&
        TrangThaiPhanBienCellRender({ data: data?.data?.cau_hoi?.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi }),
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: t("field.trang_thai_phan_bien"),
        data: trangThaiPhanBien
      }
    },
    {
      headerName: t("field.ngay_han_phan_bien"),
      field: "ngay_han_phan_bien",
      filter: "agDateColumnFilter",
      cellRenderer: DateFormat
    },
    {
      headerName: t("field.loai_thi"),
      field: "loai_thi",
      cellRenderer: (data: any) => LoaiThiCellRender({ data: data?.data?.loai_thi }),
      filter: false
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      minWidth: 180,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onEditItem: (item: HocPhanCauHoiChuong) => {
          setIsEdit(true);
          setCauHoiSelect(item);
          setShowModal(true);
        },
        onChangeStatus: (item: HocPhanCauHoiChuong) => {
          setCauHoiSelect(item);
          setShowChangeSttModal(true);
        },
        onAssignTestType: (item: HocPhanCauHoiChuong) => {
          setCauHoiSelect(item);
          setShowAssignTestTypeModal(true);
        }
      },
      filter: false
    }
  ]);
  const [showChangeSttModal, setShowChangeSttModal] = useState<boolean>(false);
  const [showAssignTestTypeModal, setShowAssignTestTypeModal] = useState<boolean>(false);
  useEffect(() => {
    const getCauHoi = async () => {
      const res = await cauHoiApi.get();
      setCauHoi(res.data);
    };

    getCauHoi();
  }, [keyRender]);

  const apiGetList = (params: any) => {
    if (params.filterModel.created_by_id) {
      params.created_by_id = params.filterModel.created_by_id.filter;
      delete params.filterModel.created_by_id;
      if (params.created_by_id.length == 0) {
        delete params.created_by_id;
      }
    }
    if (params.filterModel.giao_vien_phan_bien) {
      params.giao_vien_phan_bien = params.filterModel.giao_vien_phan_bien.filter;
      delete params.filterModel.giao_vien_phan_bien;
      if (params.giao_vien_phan_bien.length == 0) {
        delete params.giao_vien_phan_bien;
      }
    }
    if (params.filterModel.trang_thai_phan_bien) {
      params.trang_thai_phan_bien = params.filterModel.trang_thai_phan_bien.filter;
      delete params.filterModel.trang_thai_phan_bien;
    }
    if (params.filterModel.ngay_han_phan_bien) {
      params.ngay_han_phan_bien = params.filterModel.ngay_han_phan_bien.dateFrom;
      delete params.filterModel.ngay_han_phan_bien;
    }
    return cauHoiApi.listCauHoiTroLy(params);
  };

  return (
    <>
      <PageContainer
        title={t("title_page")}
        extraTitle={
          <Button
            onClick={() => {
              setShowModal(true);
              setCauHoiSelect(undefined);
            }}
            type="primary"
            style={{ float: "right" }}
          >
            {t("title.create_new")}
          </Button>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={apiGetList}
          gridOption={{ defaultColDef: defaultColDef }}
          key={keyRender}
        ></BaseTable>
        <CreatNEditPhanBienDialog
          showModal={showModal}
          setShowModal={setShowModal}
          data={cauHoi}
          giaoVien={giaoVien}
          setKeyRender={setKeyRender}
          translation="danh-sach-cau-hoi"
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          dataItem={cauHoiSelect?.cau_hoi}
        />
        <ChangeStatusDialog
          showModal={showChangeSttModal}
          setShowModal={setShowChangeSttModal}
          setKeyRender={setKeyRender}
          translation="danh-sach-cau-hoi"
          dataItem={cauHoiSelect?.cau_hoi}
          dataStatus={trangThaiCauHoi}
        />
        <AssignTestTypeDialog
          showModal={showAssignTestTypeModal}
          setShowModal={setShowAssignTestTypeModal}
          setKeyRender={setKeyRender}
          translation="danh-sach-cau-hoi"
          dataItem={cauHoiSelect}
        />
      </PageContainer>
    </>
  );
};
const DanhSachCauHoiTroLyMobile: FC<{ setKeyRender: any }> = () => {
  const [giaoVien, setGiaoVien] = useState<GiaoVien[]>([]);
  const { t } = useTranslation("danh-sach-cau-hoi");
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [cauHoiSelect, setCauHoiSelect] = useState<HocPhanCauHoiChuong>();
  const [cauHoi, setCauHoi] = useState<HocPhanCauHoiChuong[]>([]);
  const [keyRender, setKeyRender] = useState(0);
  const [showChangeSttModal, setShowChangeSttModal] = useState<boolean>(false);
  const [showAssignTestTypeModal, setShowAssignTestTypeModal] = useState<boolean>(false);

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
    const getGiaoVien = async () => {
      const res = await giaoVienApi.cache();
      if (res.data && res.data.length > 0) setGiaoVien(res.data);
    };
    getGiaoVien();
  }, []);
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await cauHoiApi.listCauHoiTroLy(filter);
      if (res.data.list.length > 0) {
        setCauHoi(res.data.list);
        setPagination((state) => {
          return {
            ...state,
            total: res.data.pagination.total
          };
        });
      } else {
        setCauHoi([]);
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
    if (filter.chu_de) {
      sendData.filterModel["chuong.ten"] = {
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
    if (filter.do_kho) {
      sendData.filterModel.do_kho = {
        filterType: "text",
        type: "contains",
        filter: filter.do_kho
      };
    }
    if (filter?.created_by_id?.length > 0) {
      sendData.created_by_id = filter.created_by_id;
    }

    if (filter.trang_thai_cau_hoi) {
      sendData.filterModel["cau_hoi.trang_thai"] = {
        filterType: "text",
        type: "contains",
        filter: filter.trang_thai_cau_hoi
      };
    }
    if (filter.ma_hoc_phan) {
      sendData.filterModel.ma_hoc_phan = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_hoc_phan
      };
    }
    if (filter?.giao_vien_phan_bien?.length > 0) {
      sendData.giao_vien_phan_bien = filter.giao_vien_phan_bien;
    }
    if (filter?.trang_thai_phan_bien?.length > 0) {
      sendData.trang_thai_phan_bien = filter.trang_thai_phan_bien;
    }
    if (filter?.ngay_han_phan_bien) {
      sendData.ngay_han_phan_bien = dayjs(filter?.ngay_han_phan_bien).format("YYYY-MM-DD");
    }
    getData(sendData);
  };

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page, keyRender]);

  const onEditItem = (item: HocPhanCauHoiChuong) => {
    setIsEdit(true);
    setCauHoiSelect(item);
    setShowModal(true);
  };

  const onChangeStatus = (item: HocPhanCauHoiChuong) => {
    setCauHoiSelect(item);
    setShowChangeSttModal(true);
  };

  const onAssignTestType = (item: HocPhanCauHoiChuong) => {
    setCauHoiSelect(item);
    setShowAssignTestTypeModal(true);
  };

  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="ma_hoc_phan"
            label={t("field.ma_hoc_phan")}
          >
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_hoc_phan", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="chu_de" label={t("field.chu_de")}>
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("chu_de", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="noi_dung" label={t("field.noi_dung")}>
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="do_kho" label={t("field.do_kho")}>
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toString()
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toString().toLowerCase())
              }
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("do_kho", value);
              }}
            >
              {doKho.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="created_by_id"
            label={t("field.created_by_id")}
          >
            <Select
              allowClear
              mode="multiple"
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("created_by_id", value);
              }}
              showSearch
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toString()
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toString().toLowerCase())
              }
              optionLabelProp="label"
            >
              {giaoVien.map((item) => (
                <Select.Option key={item.name} value={item.name} label={item.name}>
                  <p>{item.name}</p>
                  <p>{item.email}</p>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="trang_thai_cau_hoi"
            label={t("field.trang_thai_cau_hoi")}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toString()
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toString().toLowerCase())
              }
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("trang_thai_cau_hoi", value);
              }}
            >
              {trangThaiCauHoi.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="giao_vien_phan_bien"
            label={t("field.giao_vien_phan_bien")}
          >
            <Select
              allowClear
              showSearch
              mode="multiple"
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toString()
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toString().toLowerCase())
              }
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("giao_vien_phan_bien", value);
              }}
              optionLabelProp="label"
            >
              {giaoVien.map((item) => (
                <Select.Option key={item.name} value={item.name} label={item.name}>
                  <p>{item.name}</p>
                  <p>{item.email}</p>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="trang_thai_phan_bien"
            label={t("field.trang_thai_phan_bien")}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toString()
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toString().toLowerCase())
              }
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("trang_thai_phan_bien", value);
              }}
            >
              {trangThaiPhanBien.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="ngay_han_phan_bien"
            label={t("field.ngay_han_phan_bien")}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ngay_han_phan_bien", date);
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
  } else if (cauHoi.length == 0) {
    Content = <div className="p-2 text-center"> Chưa có câu hỏi nào</div>;
  } else {
    Content = (
      <>
        {cauHoi.map((record, key) => {
          const trangThai = record?.cau_hoi?.trang_thai;
          const trangThaiCauHoi = record?.cau_hoi?.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi;
          const loaiThi = record?.cau_hoi?.loai_thi[0]?.loai;
          const newTitle =
            trangThai == "cho_phan_bien"
              ? t("tooltip.giao_phan_bien")
              : (trangThai === STATUS_QUESTION.CHO_DUYET1 || trangThai === STATUS_QUESTION.CHO_DUYET2) &&
                  trangThaiCauHoi === STATUS_QUESTION.CHO_DUYET
                ? t("tooltip.change_phan_bien")
                : trangThai === STATUS_QUESTION.CHO_DUYET2
                  ? t("tooltip.giao_phan_bien_2")
                  : "";
          return (
            <Col span={24} key={key} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>{t("field.stt")}: </strong> {key + 1}
                </p>
                <div className="my-1">
                  <strong>{t("field.cau_hoi_id")}: </strong> {record.cau_hoi_id}
                </div>
                <div className="my-1">
                  <strong>{t("field.ma_hoc_phan")}: </strong> {record.ma_hoc_phan}
                </div>
                <div className="my-1">
                  <strong>{t("field.chu_de")}: </strong> {record.chuong?.ten}
                </div>
                <div className="my-1">
                  <strong>{t("field.noi_dung")}: </strong> {renderMath(record.cau_hoi.noi_dung)}
                </div>
                <p className="my-1">
                  <strong>{t("field.do_kho")}: </strong> {DoKhoCellRender({ data: record.do_kho })}
                </p>
                <p className="my-1">
                  <strong>{t("field.created_by_id")}: </strong> {GiaoVienTaoCellRender({ data: record })}
                </p>
                <p className="my-1">
                  <strong>{t("field.trang_thai_cau_hoi")}: </strong> {TrangThaiCauHoiCellRender({ data: trangThai })}
                </p>
                <p className="my-1">
                  <strong>{t("field.giao_vien_phan_bien")}: </strong>{" "}
                  {record.cau_hoi?.cau_hoi_phan_bien[0]?.giao_vien.name}
                </p>
                <div className="my-1">
                  <strong>{t("field.trang_thai_phan_bien")}: </strong>{" "}
                  {TrangThaiPhanBienCellRender({ data: trangThaiCauHoi })}
                </div>
                <div className="my-1">
                  <strong>{t("field.ngay_han_phan_bien")}: </strong> <DateFormat data={record} />
                </div>
                <div className="my-1">
                  <strong>{t("field.loai_thi")}: </strong> {LoaiThiCellRender({ data: loaiThi })}
                </div>
                <div className="flex justify-center">
                  <Tooltip title={newTitle}>
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      disabled={
                        record.cau_hoi.cau_hoi_phan_bien
                          ? record.cau_hoi.trang_thai == STATUS_QUESTION.DANG_SU_DUNG ||
                            record.cau_hoi.trang_thai == STATUS_QUESTION.CAN_SUA
                          : false
                      }
                      type="text"
                      onClick={() => onEditItem(record)}
                    />
                  </Tooltip>
                  <Tooltip title={t("tooltip.doi_trang_thai")}>
                    <Button shape="circle" icon={<SyncOutlined />} type="text" onClick={() => onChangeStatus(record)} />
                  </Tooltip>
                  <Tooltip title={t("tooltip.gan_loai_thi")}>
                    <Button
                      shape="circle"
                      icon={<PaperClipOutlined />}
                      type="text"
                      onClick={() => onAssignTestType(record)}
                    />
                  </Tooltip>
                  <Tooltip title={t("action.detail")}>
                    <Link to={"" + record.cau_hoi.id}>
                      <Button shape="circle" type="text">
                        <i className="fa-solid fa-chevron-right"></i>
                      </Button>
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
    <PageContainer
      title={t("title_page")}
      extraTitle={
        <Button
          onClick={() => {
            setShowModal(true);
            setCauHoiSelect(undefined);
          }}
          type="primary"
          style={{ float: "right" }}
        >
          {t("title.create_new")}
        </Button>
      }
    >
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      <CreatNEditPhanBienDialog
        showModal={showModal}
        setShowModal={setShowModal}
        data={cauHoi}
        giaoVien={giaoVien}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        dataItem={cauHoiSelect?.cau_hoi}
      />
      <ChangeStatusDialog
        showModal={showChangeSttModal}
        setShowModal={setShowChangeSttModal}
        data={cauHoi}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
        dataItem={cauHoiSelect?.cau_hoi}
        dataStatus={trangThaiCauHoi}
      />
      <AssignTestTypeDialog
        showModal={showAssignTestTypeModal}
        setShowModal={setShowAssignTestTypeModal}
        data={cauHoi}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
        dataItem={cauHoiSelect}
      />
    </PageContainer>
  );
};

const ActionCellRender: FC<any> = ({ onEditItem, data, onChangeStatus, onAssignTestType }) => {
  const { t } = useTranslation("danh-sach-cau-hoi");

  const trangThai = data?.cau_hoi?.trang_thai;
  const trangThaiCauHoi = data?.cau_hoi?.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi;

  const newTitle =
    trangThai == "cho_phan_bien"
      ? t("tooltip.giao_phan_bien")
      : (trangThai === STATUS_QUESTION.CHO_DUYET1 || trangThai === STATUS_QUESTION.CHO_DUYET2) &&
          trangThaiCauHoi === STATUS_QUESTION.CHO_DUYET
        ? t("tooltip.change_phan_bien")
        : trangThai === STATUS_QUESTION.CHO_DUYET2
          ? t("tooltip.giao_phan_bien_2")
          : undefined;

  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title={newTitle}>
        <Button
          shape="circle"
          icon={<EditOutlined />}
          type="text"
          disabled={
            data.cau_hoi.cau_hoi_phan_bien
              ? data.cau_hoi.trang_thai == STATUS_QUESTION.DANG_SU_DUNG ||
                data.cau_hoi.trang_thai == STATUS_QUESTION.CAN_SUA
              : false
          }
          onClick={() => onEditItem(data)}
        />
      </Tooltip>
      <Tooltip title={t("tooltip.doi_trang_thai")}>
        <Button shape="circle" icon={<SyncOutlined />} type="text" onClick={() => onChangeStatus(data)} />
      </Tooltip>
      <Tooltip title={t("tooltip.gan_loai_thi")}>
        <Button shape="circle" icon={<PaperClipOutlined />} type="text" onClick={() => onAssignTestType(data)} />
      </Tooltip>
      <Tooltip title={t("action.detail")}>
        <Link to={"" + data.cau_hoi.id}>
          <Button shape="circle" type="text">
            <i className="fa-solid fa-chevron-right"></i>
          </Button>
        </Link>
      </Tooltip>
    </>
  );
};

const DateFormat: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }

  const ngayHanPhanBien = data?.cau_hoi?.cau_hoi_phan_bien?.[0]?.ngay_han_phan_bien;

  if (!ngayHanPhanBien) {
    return <span></span>;
  }

  const formatDate = dayjs(ngayHanPhanBien).format("DD/MM/YYYY");
  return <span>{formatDate}</span>;
};
