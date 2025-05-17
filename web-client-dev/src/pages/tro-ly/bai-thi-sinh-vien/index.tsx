import { ChuongCellRender, LoaiThiCellRender } from "@/components/TrangThaiCellRender";
import { Button, Card, Col, DatePicker, Form, Input, Pagination, Row, Spin, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import PageContainer from "@/Layout/PageContainer";
import baiThiApi from "@/api/baiThi/baiThi.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { DeleteOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const DanhSachBaiThiSinhVienPage: FC<any> = () => {
  const contentDesktop = () => <DanhSachBaiThiSinhVienDesktop />;
  const contentMobile = () => <DanhSachBaiThiSinhVienMobile />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default DanhSachBaiThiSinhVienPage;

const DanhSachBaiThiSinhVienDesktop: FC<any> = () => {
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [data, setData] = useState<any>();
  const { t } = useTranslation("danh-sach-bai-thi");
  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Kì học",
      field: "ki_hoc",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_hp"),
      field: "ma_hp",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ten"),
      field: "ten",
      filter: "agTextColumnFilter",
      cellRenderer: (data: any) => ChuongCellRender({ ten: data?.data?.ten, stt: data?.data?.chuong_stt })
    },
    {
      headerName: t("field.mssv"),
      field: "mssv",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.name"),
      field: "name",
      floatingFilter: false,
      cellRenderer: SinhVienCellRender
    },
    {
      headerName: t("field.bat_dau_thi_at"),
      field: "bat_dau_thi_at",
      filter: "agDateColumnFilter",
      cellRenderer: (data: any) => DateFormat({ value: data?.value })
    },
    {
      headerName: t("field.ket_thuc_thi_at"),
      field: "ket_thuc_thi_at",
      filter: "agDateColumnFilter",
      cellRenderer: (data: any) => DateFormat({ value: data?.value })
    },
    {
      headerName: t("field.loai"),
      field: "loai",
      filter: false,
      cellRenderer: (data: any) => LoaiThiCellRender({ data: data?.value })
    },
    {
      headerName: t("field.diem"),
      field: "diem",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 120,
      cellRenderer: ActionCellRender,
      filter: false,
      cellRendererParams: {
        onDeleteItem: (item: any) => {
          setData(item);
          setIsModalDelete(true);
        }
      }
    }
  ]);

  return (
    <>
      <PageContainer title={t("title_page")}>
        <BaseTable
          columns={columnDefs}
          api={baiThiApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
          key={keyRender}
        ></BaseTable>

        <DeleteDialog
          openModal={isModalDelete}
          translation="danh-sach-bai-thi"
          closeModal={setIsModalDelete}
          name={"Bài thi này"}
          apiDelete={() => data && baiThiApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </PageContainer>
    </>
  );
};
const DanhSachBaiThiSinhVienMobile: FC<any> = () => {
  const { t } = useTranslation("danh-sach-bai-thi");
  const [loading, setLoading] = useState<boolean>(false);
  const [baiThi, setBaiThi] = useState<any[]>([]);

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
      const res = await baiThiApi.list(filter);
      if (res.data.list.length > 0) {
        setBaiThi(res.data.list);
        setPagination((state) => {
          return {
            ...state,
            total: res.data.pagination.total
          };
        });
      } else {
        setBaiThi([]);
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
    if (filter.ma_hp) {
      sendData.filterModel.ma_hp = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_hp
      };
    }
    if (filter.ten) {
      sendData.filterModel.ten = {
        filterType: "text",
        type: "contains",
        filter: filter.ten
      };
    }
    if (filter.name) {
      sendData.filterModel.name = {
        filterType: "text",
        type: "contains",
        filter: filter.name
      };
    }
    if (filter?.bat_dau_thi_at) {
      sendData.bat_dau_thi_at = dayjs(filter?.bat_dau_thi_at).format("YYYY-MM-DD");
    }
    if (filter?.ket_thuc_thi_at) {
      sendData.ket_thuc_thi_at = dayjs(filter?.ket_thuc_thi_at).format("YYYY-MM-DD");
    }
    if (filter.loai) {
      sendData.filterModel.loai = {
        filterType: "text",
        type: "contains",
        filter: filter.loai
      };
    }
    if (filter.thoi_gian_thi_cho_phep) {
      sendData.filterModel.thoi_gian_thi_cho_phep = {
        filterType: "text",
        type: "contains",
        filter: filter.thoi_gian_thi_cho_phep
      };
    }
    getData(sendData);
  };

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);

  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hp" label={t("field.ma_hp")}>
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten" label={t("field.ten")}>
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="name" label={t("field.name")}>
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("name", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="bat_dau_thi_at"
            label={t("field.bat_dau_thi_at")}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("bat_dau_thi_at", date);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="ket_thuc_thi_at"
            label={t("field.ket_thuc_thi_at")}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ket_thuc_thi_at", date);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="thoi_gian_thi_cho_phep"
            label={t("field.thoi_gian_thi_cho_phep")}
          >
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("thoi_gian_thi_cho_phep", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="loai" label={t("field.loai")}>
            <Input
              allowClear
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("loai", e.target.value);
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
  } else if (baiThi.length == 0) {
    Content = <div className="p-2 text-center"> Chưa có câu hỏi nào</div>;
  } else {
    Content = (
      <>
        {baiThi.map((record, key) => {
          return (
            <Col span={24} key={key} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>STT: </strong> {key + 1}
                </p>
                <div className="my-1">
                  <strong>{t("field.ma_hp")}: </strong> {record.ma_hp}
                </div>
                <div className="my-1">
                  <strong>{t("field.ten")}: </strong> {record.ten}
                </div>
                <div className="my-1">
                  <strong>{t("field.name")}: </strong> {record.name}
                </div>
                <div className="my-1">
                  <strong>{t("field.bat_dau_thi_at")}: </strong> <DateFormat value={record.bat_dau_thi_at} />
                </div>
                <div className="my-1">
                  <strong>{t("field.ket_thuc_thi_at")}: </strong> <DateFormat value={record.ket_thuc_thi_at} />
                </div>
                <div className="my-1">
                  <strong>{t("field.thoi_gian_thi_cho_phep")}: </strong> {record.thoi_gian_thi_cho_phep}
                </div>
                <div className="my-1">
                  <strong>{t("field.loai")}: </strong> {record.loai}
                </div>
                <div className="my-1">
                  <strong>{t("field.diem")}: </strong> {record.diem}
                </div>
                <div className="flex justify-center">
                  <Tooltip title={t("action.detail")}>
                    <Link to={"" + record.id}>
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
    <PageContainer title={t("title_page")}>
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </PageContainer>
  );
};

const ActionCellRender: FC<any> = ({ data, onDeleteItem }) => {
  const { t } = useTranslation("danh-sach-bai-thi");

  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title={t("action.detail")}>
        <Link to={"" + data.id}>
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

const DateFormat: FC<any> = ({ value }) => {
  if (!value) {
    return <span></span>;
  }

  const ngayThi = value;

  if (!ngayThi) {
    return <span></span>;
  }

  const formatDate = dayjs(ngayThi).format("DD/MM/YYYY - HH:mm");
  return <span>{formatDate}</span>;
};

const SinhVienCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  if (data.name) {
    return <span>{data.name}</span>;
  } else {
    return <div></div>;
  }
};
