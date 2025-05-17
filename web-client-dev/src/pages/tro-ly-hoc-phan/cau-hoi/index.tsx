import { Button, Card, Checkbox, Col, DatePicker, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import {
  CauHoiCellRender,
  DoKhoCellRender,
  GiaoVienPhanBienCellRender,
  GiaoVienTaoCellRender,
  LoaiThiCellRender,
  TrangThaiCauHoiCellRender,
  TrangThaiPhanBienCellRender
} from "../../../components/TrangThaiCellRender";
import { EditOutlined, PaperClipOutlined, ToolOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";
import selectFilterGiaoVien, { renderOptionGiaoVienId } from "@/components/custom-filter/selectFilterGiaoVien";

import { ActionField } from "@/interface/common";
import AssignTestTypeDialog from "@/pages/tro-ly/cau-hoi/dialogAssignTestType";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import { ColDef } from "ag-grid-community";
import CreatNEditPhanBienDialog from "../createNEditPhanBien";
import { GiaoVien } from "@/interface/giaoVien";
import { HocPhanCauHoiChuong } from "@/interface/hoc-phan";
import { Link } from "react-router-dom";
import ModalCauHoiGv from "@/pages/giao-vien/cau-hoi/modal-cau-hoi-gv";
import PageContainer from "@/Layout/PageContainer";
import { Paginate } from "@/interface/axios";
import { PaginationProps } from "antd/lib";
import { STATUS_QUESTION } from "@/constant";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";
import filterAggridComponent from "@/components/custom-filter/filterAggridComponent";
import giaoVienApi from "@/api/user/giaoVien.api";
import hosPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import { renderMath } from "@/components/TrangThaiCellRender/utils";
import { useGiaoVienApi } from "@/hooks/useGiaoVien";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const loaiThis = [
  {
    value: "thi_thu",
    label: "Thi thử"
  },
  {
    value: "thi_that",
    label: "Thi thật"
  }
];
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
  },
  {
    value: "can_sua_do_kho",
    label: "Cần sửa độ khó"
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
const DanhSachCauHoiPage: FC<any> = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <DanhSachCauHoiDesktop />;
  const contentMobile = () => <DanhSachCauHoiMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default DanhSachCauHoiPage;

const DanhSachCauHoiDesktop: FC<any> = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("danh-sach-cau-hoi");
  const [keyRender, setKeyRender] = useState(0);
  const [cauHoi, setCauHoi] = useState<HocPhanCauHoiChuong[]>([]);
  const [cauHoiSelect, setCauHoiSelect] = useState<HocPhanCauHoiChuong>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [suaCauHoi, setSuaCauHoi] = useState<boolean>(false);
  const [isCopy, setIsCopy] = useState(false);
  const [columnDefs, setColumDefs] = useState<ColDef<HocPhanCauHoiChuong & ActionField>[]>([]);
  const [showAssignTestTypeModal, setShowAssignTestTypeModal] = useState<boolean>(false);
  const { items: giaoVien, getData: getDataGiaoVien } = useGiaoVienApi({ with: "user" });
  useEffect(() => {
    const giao_vien_column: ColDef = {
      headerName: t("field.giao_vien_phan_bien"),
      field: "giao_vien_phan_bien",
      floatingFilter: true,
      filter: filterAggridComponent,
      cellRenderer: GiaoVienPhanBienCellRender
    };
    const created_by_id_column: ColDef = {
      headerName: t("field.created_by_id"),
      field: "cau_hoi.created_by_id",
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: t("field.created_by_id"),
        getData: getDataGiaoVien,
        renderOption: renderOptionGiaoVienId
      },
      filter: SelectFilter,
      cellRenderer: GiaoVienTaoCellRender
    };

    if (giaoVien && giaoVien.length > 0) {
      (giao_vien_column.floatingFilterComponent = selectFilterGiaoVien),
        (giao_vien_column.floatingFilterComponentParams = {
          suppressFilterButton: true,
          placeholder: t("field.created_by_id"),
          data: giaoVien?.map((x) => ({
            name: x.name,
            id: x.name,
            email: x.email
          }))
        });
    }
    setColumDefs([
      {
        headerName: t("field.cau_hoi_id"),
        field: "cau_hoi_id",
        sortable: true,
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ma_hoc_phan"),
        field: "ma_hoc_phan",
        sortable: true,
        filter: SelectFilter,
        floatingFilter: true,
        filterParams: {
          type: "equal"
        },
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: t("field.ma_hoc_phan"),
          getData: () => {
            return queryClient.fetchQuery({
              queryKey: ["hoc-phan-quan-ly"],
              queryFn: () => {
                return hosPhanChuongApi
                  .list()
                  .then((res) => res.data.map((x: any) => ({ label: x.ma_hoc_phan, value: x.ma_hoc_phan })));
              },
              staleTime: Infinity
            });
          }
        }
      },
      {
        headerName: t("field.stt_chu_de"),
        field: "chuong.stt",
        sortable: true,
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.chu_de"),
        field: "chuong.ten",
        filter: "agTextColumnFilter"
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
        headerName: t("field.noi_dung"),
        field: "cau_hoi.noi_dung",
        cellClass: "customCell",
        cellRenderer: (data: any) =>
          data?.data?.cau_hoi?.noi_dung && (
            <div className="overflow-hidden" style={{ height: "40px" }}>
              <CauHoiCellRender data={data?.data?.cau_hoi?.noi_dung}></CauHoiCellRender>
            </div>
          ),
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains"],
          suppressAndOrCondition: true,
          defaultOption: "contains"
        }
      },
      {
        headerName: t("field.do_kho"),
        field: "do_kho",
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
      created_by_id_column,
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
      giao_vien_column,
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
        filter: SelectFilter,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: t("field.loai_thi"),
          data: loaiThis
        }
      },
      {
        headerName: t("field.action"),
        field: "action",
        pinned: "right",
        width: 150,
        cellRenderer: ActionCellRender,
        cellRendererParams: {
          onEditItem: (item: HocPhanCauHoiChuong) => {
            setIsEdit(true);
            setCauHoiSelect(item);
            item.cau_hoi.trang_thai == STATUS_QUESTION.CAN_SUA ? setSuaCauHoi(true) : setShowModal(true);
          },
          onAssignTestType: (item: HocPhanCauHoiChuong) => {
            setCauHoiSelect(item);
            setShowAssignTestTypeModal(true);
          }
        },
        filter: false
      }
    ]);
  }, [keyRender, giaoVien]);
  useEffect(() => {
    const getCauHoi = async () => {
      const res = await cauHoiApi.get();
      setCauHoi(res.data);
    };

    getCauHoi();
  }, [keyRender]);

  const apiGetList = (params: any) => {
    params = cloneDeep(params);
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
    return cauHoiApi.list(params);
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
        <ModalCauHoiGv
          openModal={suaCauHoi}
          closeModal={setSuaCauHoi}
          isEdit={isEdit}
          setEdit={setIsEdit}
          isCopy={isCopy}
          setCopy={setIsCopy}
          setKeyRender={setKeyRender}
          dataEdit={cauHoiSelect?.cau_hoi}
          isFormAddQuestion={false}
          isFormAddManyQuestion={false}
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
    </>
  );
};
const DanhSachCauHoiMobile: FC<{ setKeyRender: any }> = () => {
  const [giaoVien, setGiaoVien] = useState<GiaoVien[]>([]);
  const { t } = useTranslation("danh-sach-cau-hoi");
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [cauHoiSelect, setCauHoiSelect] = useState<HocPhanCauHoiChuong>();
  const [cauHoi, setCauHoi] = useState<HocPhanCauHoiChuong[]>([]);
  const [keyRender, setKeyRender] = useState(0);
  const [suaCauHoi, setSuaCauHoi] = useState<boolean>(false);
  const [isCopy, setIsCopy] = useState(false);
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
      const res = await cauHoiApi.list(filter);
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
    if (filter.ma_hoc_phan) {
      sendData.filterModel.ma_hoc_phan = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_hoc_phan
      };
    }
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
    if (filter?.giao_vien_phan_bien) {
      sendData.giao_vien_phan_bien = filter.giao_vien_phan_bien;
    }
    if (filter?.trang_thai_phan_bien) {
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
    item.cau_hoi.trang_thai == STATUS_QUESTION.CAN_SUA ? setSuaCauHoi(true) : setShowModal(true);
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
            trangThai == STATUS_QUESTION.CHO_PHAN_BIEN
              ? t("tooltip.giao_phan_bien")
              : (trangThai === STATUS_QUESTION.CHO_DUYET1 || trangThai === STATUS_QUESTION.CHO_DUYET2) &&
                  trangThaiCauHoi === STATUS_QUESTION.CHO_DUYET
                ? t("tooltip.change_phan_bien")
                : trangThai === STATUS_QUESTION.CHO_PHAN_BIEN2
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
                  {record.cau_hoi.trang_thai !== STATUS_QUESTION.CAN_SUA ? (
                    <Tooltip title={newTitle}>
                      <Button
                        shape="circle"
                        icon={<EditOutlined />}
                        disabled={
                          record.cau_hoi.cau_hoi_phan_bien
                            ? record.cau_hoi.trang_thai == STATUS_QUESTION.DANG_SU_DUNG ||
                              record.cau_hoi.trang_thai == STATUS_QUESTION.CAN_SUA ||
                              record.cau_hoi.trang_thai == STATUS_QUESTION.SUA_DO_KHO ||
                              record.cau_hoi.trang_thai == STATUS_QUESTION.PHE_DUYET_DO_KHO
                            : false
                        }
                        type="text"
                        onClick={() => onEditItem(record)}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title={newTitle}>
                      <Button shape="circle" icon={<ToolOutlined />} type="text" onClick={() => onEditItem(record)} />
                    </Tooltip>
                  )}
                  <Tooltip title={t("tooltip.gan_loai_thi")}>
                    <Button
                      shape="circle"
                      icon={<PaperClipOutlined />}
                      type="text"
                      onClick={() => onAssignTestType(record)}
                    />
                  </Tooltip>
                  <Tooltip title={t("action.detail")}>
                    <Link to={`danh-sach-cau-hoi/${record.cau_hoi_id}`}>
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
      <ModalCauHoiGv
        openModal={suaCauHoi}
        closeModal={setSuaCauHoi}
        isEdit={isEdit}
        setEdit={setIsEdit}
        isCopy={isCopy}
        setCopy={setIsCopy}
        setKeyRender={setKeyRender}
        dataEdit={cauHoiSelect?.cau_hoi}
        isFormAddQuestion={false}
        isFormAddManyQuestion={false}
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

const ActionCellRender: FC<any> = ({ onEditItem, data, onAssignTestType }) => {
  const { t } = useTranslation("danh-sach-cau-hoi");

  const trangThai = data?.cau_hoi?.trang_thai;
  const trangThaiCauHoi = data?.cau_hoi?.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi;

  const newTitle =
    trangThai == STATUS_QUESTION.CHO_PHAN_BIEN
      ? t("tooltip.giao_phan_bien")
      : (trangThai === STATUS_QUESTION.CHO_DUYET1 || trangThai === STATUS_QUESTION.CHO_DUYET2) &&
          trangThaiCauHoi === STATUS_QUESTION.CHO_DUYET
        ? t("tooltip.change_phan_bien")
        : trangThai === STATUS_QUESTION.CHO_PHAN_BIEN2
          ? t("tooltip.giao_phan_bien_2")
          : undefined;

  if (!data) {
    return <span></span>;
  }
  return (
    <>
      {data.cau_hoi.trang_thai !== STATUS_QUESTION.CAN_SUA ? (
        <Tooltip title={newTitle}>
          <Button
            shape="circle"
            icon={<EditOutlined />}
            type="text"
            disabled={
              !data.is_primary ||
              (data.cau_hoi.cau_hoi_phan_bien
                ? data.cau_hoi.trang_thai == STATUS_QUESTION.DANG_SU_DUNG ||
                  data.cau_hoi.trang_thai == STATUS_QUESTION.CAN_SUA ||
                  data.cau_hoi.trang_thai == STATUS_QUESTION.SUA_DO_KHO ||
                  data.cau_hoi.trang_thai == STATUS_QUESTION.PHE_DUYET_DO_KHO
                : false)
            }
            onClick={() => onEditItem(data)}
          />
        </Tooltip>
      ) : (
        <Tooltip title={newTitle}>
          <Button shape="circle" icon={<ToolOutlined />} type="text" onClick={() => onEditItem(data)} />
        </Tooltip>
      )}
      <Tooltip title={t("tooltip.gan_loai_thi")}>
        <Button
          shape="circle"
          icon={<PaperClipOutlined />}
          type="text"
          onClick={() => onAssignTestType(data)}
          disabled={!data.is_primary}
        />
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
