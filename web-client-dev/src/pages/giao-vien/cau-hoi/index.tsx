import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Tooltip } from "antd";
import {
  CauHoiCellRender,
  ChuongCellRender,
  DoKhoCellRender,
  LoaiCauHoiCellRender,
  TrangThaiCauHoiCellRender
} from "@/components/TrangThaiCellRender";
import { CopyOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, RightOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import { ColDef } from "ag-grid-community";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { HocPhanCauHoi } from "@/interface/cauHoi";
import { Link } from "react-router-dom";
import MathDisplay from "@/components/MathDisplay";
import ModalCauHoiGv from "./modal-cau-hoi-gv";
import ModalXemTruocCauHoi from "./modal-xem-truoc-cau-hoi";
import PageContainer from "@/Layout/PageContainer";
import { Paginate } from "@/interface/axios";
import { PaginationProps } from "antd/lib";
import { STATUS_QUESTION } from "@/constant";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const getRowClass = (params: any) => {
  if (params.data?.noi_dung) {
    return "overflow-hidden";
  }
  return "";
};
const gridOption = { defaultColDef };
const isTrangThai = [
  {
    value: "moi_tao",
    label: "Mới tạo"
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
    value: "cho_duyet_lan_1",
    label: "Chờ duyệt lần 1"
  },
  {
    value: "cho_duyet_lan_2",
    label: "Chờ duyệt lần 2"
  },
  {
    value: "can_sua",
    label: "Cần sửa"
  },
  {
    value: "dang_su_dung",
    label: "Đang sử dụng"
  },
  {
    value: "can_sua_do_kho",
    label: "Cần sửa độ khó"
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

const isLoai = [
  { value: "single", label: "Một đáp án" },
  { value: "multi", label: "Nhiều đáp án" }
];

const CauHoiGvPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <TaiLieuPageDesktop />;
  const contentMobile = () => <TaiLieuPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default CauHoiGvPage;

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data, onViewItem, onCopyItem }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button
          shape="circle"
          icon={<EditOutlined />}
          type="text"
          onClick={() => onUpdateItem(data)}
          disabled={
            data?.trang_thai !== STATUS_QUESTION.MOI_TAO &&
            data?.trang_thai !== STATUS_QUESTION.CAN_SUA &&
            data?.trang_thai !== STATUS_QUESTION.SUA_DO_KHO
          }
        />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
      <Tooltip title="Xem đầy đủ">
        <Button shape="circle" icon={<InfoCircleOutlined />} type="text" onClick={() => onViewItem(data)} />
      </Tooltip>
      <Tooltip title="Copy">
        <Button shape="circle" icon={<CopyOutlined />} type="text" onClick={() => onCopyItem(data)} />
      </Tooltip>
      <Tooltip title="Chi tiết">
        <Link to={`${data.id}`}>
          <Button shape="circle" type="text">
            <RightOutlined />
          </Button>
        </Link>
      </Tooltip>
    </>
  );
};

// const DoKhoCellRender: FC<any> = ({ data }) => {
//   switch (data?.do_kho) {
//     case "easy":
//       return "Dễ";
//     case "medium":
//       return "Trung bình";
//     case "hard":
//       return "Khó";
//     default:
//       return <></>;
//   }
// };

const NoiDungCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return <MathDisplay mathString={data.noi_dung} />;
};

const TaiLieuPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormAddQuestion, setIsFormAddQuestion] = useState(true);
  const [dataEdit, setDataEdit] = useState<HocPhanCauHoi | undefined>();
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const [modalDelete, setModalDelete] = useState(false);
  const [idCauHoiSelected, setIdCauHoiSelected] = useState<number>();
  const [isOpenXemTruoc, setIsOpenXemTruoc] = useState(false);
  const [isFormAddManyQuestion, setIsFormAddManyQuestion] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  const [columnDefs] = useState<ColDef<HocPhanCauHoi & ActionField>[]>([
    {
      headerName: t("field.id"),
      field: "id",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_hoc_phan"),
      field: "primary_chuong.ma_hoc_phan",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ten"),
      field: "primary_chuong.chuong.ten",
      filter: "agTextColumnFilter",
      cellRenderer: ({ data }: any) => (
        <ChuongCellRender
          ten={data?.primary_chuong?.chuong?.ten}
          stt={data?.primary_chuong?.chuong?.stt}
        ></ChuongCellRender>
      )
    },
    {
      headerName: t("field.noi_dung_cau_hoi"),
      field: "noi_dung",
      filter: "agTextColumnFilter",
      cellClass: "customCell",
      cellRenderer: NoiDungCellRender
    },
    {
      headerName: t("field.loai"),
      field: "loai",
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
      field: "primary_chuong.do_kho",
      cellRenderer: (data: any) => {
        return data?.data?.primary_chuong?.do_kho && DoKhoCellRender({ data: data?.data?.primary_chuong.do_kho });
      },
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        placeholder: t("field.do_kho"),
        data: doKho
      }
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai",
      cellRenderer: (data: any) =>
        data?.data?.trang_thai && TrangThaiCauHoiCellRender({ data: data?.data?.trang_thai }),
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        data: isTrangThai
      }
    },
    {
      headerName: t("field.ly_do"),
      field: "cau_hoi_phan_bien.ly_do",
      cellClass: "customCell",
      filter: "agTextColumnFilter",
      cellRenderer: (data: any) => {
        if (data?.data?.trang_thai == "can_sua" && data?.data?.cau_hoi_phan_bien?.[0]?.trang_thai_cau_hoi == "tu_choi")
          return (
            data?.data?.cau_hoi_phan_bien?.[0]?.ly_do &&
            CauHoiCellRender({ data: data?.data?.cau_hoi_phan_bien?.[0].ly_do })
          );
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      minWidth: 200,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: HocPhanCauHoi) => {
          setIsEdit(true);
          setIsModalOpen(true);
          setDataEdit(item);
        },
        onDeleteItem: (item: HocPhanCauHoi) => {
          setIdCauHoiSelected(item.id);
          setModalDelete(true);
        },
        onViewItem: (item: HocPhanCauHoi) => {
          setDataEdit(item);
          setIsOpenXemTruoc(true);
        },
        onCopyItem: (item: HocPhanCauHoi) => {
          setIsCopy(true);
          setIsModalOpen(true);
          setDataEdit(item);
        }
      },
      filter: false
    }
  ]);
  return (
    <>
      <PageContainer
        title="Danh sách câu hỏi"
        extraTitle={
          <Space
            style={{
              float: "right",
              display: "flex",
              flexDirection: "row",
              alignItems: "end"
            }}
          >
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddQuestion(true);
                setIsFormAddManyQuestion(false);
              }}
              type="primary"
            >
              {t("action.create_new")}
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddQuestion(false);
                setIsFormAddManyQuestion(false);
              }}
              type="primary"
            >
              Thêm bằng văn bản
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddManyQuestion(true);
                setIsFormAddQuestion(true);
              }}
              type="primary"
            >
              Thêm nhiều
            </Button>
          </Space>
        }
      >
        <BaseTable
          key={keyRender}
          columns={columnDefs}
          api={cauHoiApi.listCauHoiGv}
          gridOption={gridOption}
          getRowClass={getRowClass}
        ></BaseTable>
        <ModalCauHoiGv
          openModal={isModalOpen}
          closeModal={setIsModalOpen}
          isEdit={isEdit}
          setEdit={setIsEdit}
          isCopy={isCopy}
          setCopy={setIsCopy}
          setKeyRender={setKeyRender}
          dataEdit={dataEdit}
          isFormAddQuestion={isFormAddQuestion}
          isFormAddManyQuestion={isFormAddManyQuestion}
        />
        <DeleteDialog
          openModal={modalDelete}
          closeModal={setModalDelete}
          apiDelete={() => idCauHoiSelected && cauHoiApi.deleteCauHoi(idCauHoiSelected)}
          setKeyRender={setKeyRender}
          translation="cau-hoi-chuong-hoc-phan"
          name={"câu hỏi"}
        />
        <ModalXemTruocCauHoi
          openModal={isOpenXemTruoc}
          closeModal={setIsOpenXemTruoc}
          setKeyRender={setKeyRender}
          dataEdit={dataEdit}
        />
      </PageContainer>
    </>
  );
};

const TaiLieuPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<HocPhanCauHoi[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormAddQuestion, setIsFormAddQuestion] = useState(true);
  const [idCauHoiSelected, setIdCauHoiSelected] = useState<number>();
  const [modalDelete, setModalDelete] = useState(false);
  const [dataEdit, setDataEdit] = useState<HocPhanCauHoi | undefined>();
  const [isFormAddManyQuestion, setIsFormAddManyQuestion] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

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
      const res = await cauHoiApi.listCauHoiGv(filter);
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
      sendData.filterModel["primary_chuong.ma_hoc_phan"] = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_hoc_phan
      };
    }
    if (filter.noi_dung) {
      sendData.filterModel.noi_dung = {
        filterType: "text",
        type: "contains",
        filter: filter.noi_dung
      };
    }
    if (filter.loai) {
      sendData.filterModel.loai = {
        filterType: "text",
        type: "contains",
        filter: filter.loai
      };
    }
    if (filter.do_kho) {
      sendData.filterModel["primary_chuong.do_kho"] = {
        filterType: "text",
        type: "contains",
        filter: filter.do_kho
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
        trang_thai: "moi_tao"
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
              options={isLoai}
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="trang_thai" label="Trạng thái">
            <Select
              allowClear
              onChange={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("trang_thai", e);
                }
              }}
              options={isTrangThai}
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
                  <strong>Mã học phần:</strong> {record.primary_chuong?.ma_hoc_phan}
                </p>
                <p className="my-1">
                  <strong>Nội dung:</strong> <MathDisplay mathString={record.noi_dung} />
                </p>
                <p className="my-1">
                  <strong>Loại: </strong>
                  {LoaiCauHoiCellRender({ data: record })}
                </p>
                <p className="my-1">
                  <strong>{t("field.do_kho")}: </strong> {DoKhoCellRender({ data: record.primary_chuong?.do_kho })}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong> {TrangThaiCauHoiCellRender({ data: record.trang_thai })}
                </p>
                <p className="my-1">
                  <strong>Lý do: </strong>{" "}
                  {record?.trang_thai == "can_sua" &&
                    record?.cau_hoi_phan_bien?.[0]?.trang_thai_cau_hoi == "tu_choi" &&
                    record?.cau_hoi_phan_bien?.[0]?.ly_do &&
                    CauHoiCellRender({ data: record?.cau_hoi_phan_bien?.[0].ly_do })}
                </p>
                <div className="flex justify-center">
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setIsEdit(true);
                        setIsModalOpen(true);
                        setDataEdit(record);
                      }}
                      disabled={
                        record?.trang_thai !== STATUS_QUESTION.MOI_TAO &&
                        record?.trang_thai !== STATUS_QUESTION.CAN_SUA &&
                        record?.trang_thai !== STATUS_QUESTION.SUA_DO_KHO
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Copy">
                    <Button
                      shape="circle"
                      icon={<CopyOutlined />}
                      type="text"
                      onClick={() => {
                        setIsCopy(true);
                        setIsModalOpen(true);
                        setDataEdit(record);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => {
                        setIdCauHoiSelected(record.id);
                        setModalDelete(true);
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

        <ModalCauHoiGv
          openModal={isModalOpen}
          closeModal={setIsModalOpen}
          isEdit={isEdit}
          setEdit={setIsEdit}
          isCopy={isCopy}
          setCopy={setIsCopy}
          setKeyRender={setKeyRender}
          dataEdit={dataEdit}
          isFormAddQuestion={isFormAddQuestion}
          isFormAddManyQuestion={isFormAddManyQuestion}
        />
        <DeleteDialog
          openModal={modalDelete}
          closeModal={setModalDelete}
          apiDelete={() => idCauHoiSelected && cauHoiApi.deleteCauHoi(idCauHoiSelected)}
          setKeyRender={setKeyRender}
          translation="cau-hoi-chuong-hoc-phan"
          name={"câu hỏi"}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Danh sách câu hỏi"
        extraTitle={
          <Space
            style={{
              float: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "end"
            }}
          >
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddQuestion(true);
              }}
              type="primary"
            >
              {t("action.create_new")}
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddQuestion(false);
              }}
              type="primary"
            >
              Thêm bằng văn bản
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddManyQuestion(true);
              }}
              type="primary"
            >
              Thêm nhiều
            </Button>
          </Space>
        }
      >
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};
