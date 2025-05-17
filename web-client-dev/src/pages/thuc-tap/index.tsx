import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Tag, Tooltip } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import { ColDef } from "ag-grid-community";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import GiaoVienFloatingFilterCompoment from "@/components/custom-filter/GiaoVienFloatingFilterCompoment";
import ModalExportThucTap from "./export-excel-ThucTap";
import PageContainer from "@/Layout/PageContainer";
import { Paginate } from "@/interface/axios";
import { PaginationProps } from "antd/lib";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { SinhVienThucTap } from "@/interface/lop";
import ViewDialog from "../giao-vien/lop-do-an/viewDialog";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import thuctapApi from "@/api/lop/thuctap.api";
import { useAppSelector } from "@/stores/hook";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const status = [
  {
    label: "Mới gửi",
    value: "0-moi-gui"
  },
  {
    label: "Duyệt",
    value: "1-duyet"
  },
  {
    label: "Từ chối",
    value: "2-tu-choi"
  }
];
const has_giao_vien = [
  {
    label: "Có",
    value: "true"
  },
  {
    label: "Không",
    value: "false"
  }
];
const ThucTapPage: FC<any> = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <ThucTapPageDesktop />;
  const contentMobile = () => <ThucTapPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default ThucTapPage;

const ActionCellRender: FC<any> = ({ onEditItem, onViewItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  const show = ["2-tu-choi", "1-duyet", null].includes(data.trang_thai);
  return (
    <>
      {!show && (
        <Tooltip title="Duyệt">
          <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onEditItem(data)} />
        </Tooltip>
      )}
      {show && (
        <Tooltip title="Xem">
          <Button shape="circle" icon={<EyeOutlined />} type="text" onClick={() => onViewItem(data)} />
        </Tooltip>
      )}
    </>
  );
};

const StatusCellRender: FC<any> = (record) => {
  if (record?.data?.trang_thai === "0-moi-gui") {
    return <Tag>Mới gửi</Tag>;
  } else if (record?.data?.trang_thai === "2-tu-choi") {
    return <Tag color="error">Từ chối</Tag>;
  } else if (record?.data?.trang_thai === "1-duyet") {
    return <Tag color="success">Đã duyệt</Tag>;
  } else if (record?.data?.trang_thai === null) {
    return <Tag className="bg-yellow-200 text-rose-500">Chưa đăng ký</Tag>;
  }
};
const StatusViewRender: FC<any> = (record) => {
  if (record === "0-moi-gui") {
    return <Tag>Mới gửi</Tag>;
  } else if (record === "2-tu-choi") {
    return <Tag color="error">Từ chối</Tag>;
  } else if (record === "1-duyet") {
    return <Tag color="success">Đã duyệt</Tag>;
  } else if (record === null) {
    return <Tag className="bg-yellow-200 text-rose-500">Chưa đăng ký</Tag>;
  } else {
    <Tag className="bg-yellow-200 text-rose-500">Chưa đăng ký</Tag>;
  }
};
const GiaoVienCellRender: FC<any> = (record) => {
  if (!record) {
    return <span></span>;
  }
  return <span>{record?.data?.giao_vien_hd || ""}</span>;
};

const ThucTapPageDesktop: FC<any> = () => {
  const { t } = useTranslation("duyet-thuc-tap");
  const { getData: getDataKiHoc } = useKiHoc();
  const [keyRender, setKeyRender] = useState(0);
  const [data, setData] = useState<SinhVienThucTap>();
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [modalView, setModalView] = useState<boolean>(false);
  const [modalExport, setModalExport] = useState(false);

  const [columnDefs] = useState<ColDef<SinhVienThucTap & ActionField>[]>([
    {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilter: true,
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData: getDataKiHoc
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData: getDataKiHoc
      }
    },
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
      headerName: t("field.ten_cong_ty"),
      field: "ten_cong_ty",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.dia_chi"),
      field: "dia_chi",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ghi_chu"),
      field: "ghi_chu",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.giao_vien_hd"),
      field: "has_giao_vien",
      filter: SelectFilter,
      floatingFilterComponent: GiaoVienFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Giáo viên hướng dẫn",
        data: has_giao_vien
      },
      cellRenderer: GiaoVienCellRender
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai",
      filter: SelectFilter,
      cellRenderer: StatusCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Trạng thái",
        data: status
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onEditItem: (item: SinhVienThucTap) => {
          setData(item);
          setModalEditor(true);
        },
        onViewItem: (item: SinhVienThucTap) => {
          setData(item);
          setModalView(true);
        }
      },
      filter: false
    }
  ]);

  const options = [
    {
      key: "0",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "1",
      label: "Mã lớp học",
      children: data?.ma
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "4",
      label: "Mã sinh viên",
      children: data?.mssv
    },
    {
      key: "5",
      label: "Tên sinh viên",
      children: data?.sinh_vien
    },
    {
      key: "6",
      label: "Tên công ty",
      children: data?.ten_cong_ty
    },
    {
      key: "7",
      label: "Địa chỉ",
      children: data?.dia_chi
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Giáo viên hướng dẫn",
      children: data?.giao_vien_hd
    },
    {
      key: "10",
      label: "Trạng thái",
      children: StatusViewRender(data?.trang_thai)
    }
  ];
  const optionsView = [
    {
      key: "0",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "1",
      label: "Mã lớp học",
      children: data?.ma
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "4",
      label: "Mã sinh viên",
      children: data?.mssv
    },
    {
      key: "5",
      label: "Tên sinh viên",
      children: data?.sinh_vien
    },
    {
      key: "6",
      label: "Tên công ty",
      children: data?.ten_cong_ty
    },
    {
      key: "7",
      label: "Địa chỉ",
      children: data?.dia_chi
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Giáo viên hướng dẫn",
      children: data?.giao_vien_hd
    },
    {
      key: "10",
      label: "Trạng thái",
      children: StatusViewRender(data?.trang_thai)
    }
  ];
  return (
    <>
      <PageContainer
        title="Danh sách phiếu thực tập"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button onClick={() => setModalExport(true)} type="primary">
              Xuất danh sách
            </Button>
          </Space>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={thuctapApi.listThucTapPage}
          gridOption={{ defaultColDef: defaultColDef }}
          key={keyRender}
        ></BaseTable>
      </PageContainer>

      <ConfirmDialog
        openModal={modalEditor}
        name={data?.sinh_vien}
        closeModal={setModalEditor}
        setKeyRender={setKeyRender}
        apiConfirm={thuctapApi.duyetThucTap}
        translation={"duyet-thuc-tap"}
        id={data?.id}
        data={data}
        title={"Duyệt phiếu thực tập"}
        options={options}
      />
      <ViewDialog
        openModal={modalView}
        closeModal={setModalView}
        translation={"duyet-thuc-tap"}
        apiConfirm={thuctapApi.duyetThucTap}
        title={"Xem phiếu thực tập"}
        optionsView={optionsView}
        id={data?.id}
        setKeyRender={setKeyRender}
        backAgree={data?.trang_thai == "1-duyet" ? true : false}
      />
      <ModalExportThucTap
        translation="duyet-thuc-tap"
        showModal={modalExport}
        setShowModal={setModalExport}
        api={thuctapApi.excelThucTap}
        data={data}
        text="danh-sach-thuc-tap"
      />
    </>
  );
};
const ThucTapPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<SinhVienThucTap[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [data, setData] = useState<SinhVienThucTap>();
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [modalView, setModalView] = useState<boolean>(false);
  const [modalExport, setModalExport] = useState(false);

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
  const options = [
    {
      key: "0",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "1",
      label: "Mã lớp học",
      children: data?.ma
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "4",
      label: "Mã sinh viên",
      children: data?.mssv
    },
    {
      key: "5",
      label: "Tên sinh viên",
      children: data?.sinh_vien
    },
    {
      key: "6",
      label: "Tên công ty",
      children: data?.ten_cong_ty
    },
    {
      key: "7",
      label: "Địa chỉ",
      children: data?.dia_chi
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Giáo viên hướng dẫn",
      children: data?.giao_vien_hd
    },
    {
      key: "10",
      label: "Trạng thái",
      children: StatusViewRender(data?.trang_thai)
    }
  ];
  const optionsView = [
    {
      key: "0",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "1",
      label: "Mã lớp học",
      children: data?.ma
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "4",
      label: "Mã sinh viên",
      children: data?.mssv
    },
    {
      key: "5",
      label: "Tên sinh viên",
      children: data?.sinh_vien
    },
    {
      key: "6",
      label: "Tên công ty",
      children: data?.ten_cong_ty
    },
    {
      key: "7",
      label: "Địa chỉ",
      children: data?.dia_chi
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Giáo viên hướng dẫn",
      children: data?.giao_vien_hd
    },
    {
      key: "10",
      label: "Trạng thái",
      children: StatusViewRender(data?.trang_thai)
    }
  ];
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await thuctapApi.listThucTapPage(filter);
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
        has_giao_vien: {
          filterType: "text",
          type: "contains",
          filter: filter.has_giao_vien
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

    getData(sendData);
  };
  useEffect(() => {
    form.setFieldsValue({ ki_hoc: kiHienGio });
    onSubmit({
      ki_hoc: kiHienGio,
      has_giao_vien: form.getFieldValue("has_giao_vien")
    });
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
        ki_hoc: kiHienGio,
        has_giao_vien: "false"
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã lớp học">
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
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="has_giao_vien"
            label="Giáo viên hướng dẫn"
          >
            <Select
              allowClear
              defaultValue={"false"}
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("has_giao_vien", value);
              }}
            >
              {has_giao_vien.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
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
              {status.map((item) => (
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
    Content = <div className="p-2 text-center"> Chưa có phiếu thực tập nào</div>;
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
                  <strong>Tên công ty:</strong> {record.ten_cong_ty}
                </p>
                <p className="my-1">
                  <strong>Địa chỉ:</strong> {record.dia_chi}
                </p>
                <p className="my-1">
                  <strong>Ghi chú:</strong> {record.ghi_chu}
                </p>
                <p className="my-1">
                  <strong>Giáo viên hướng dẫn:</strong> {record.giao_vien_hd}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong> {StatusViewRender(record?.trang_thai)}
                </p>
                <div className="flex justify-center">
                  {!["2-tu-choi", "1-duyet", null].includes(record.trang_thai) && (
                    <Tooltip title="Duyệt">
                      <Button
                        shape="circle"
                        icon={<EditOutlined />}
                        type="text"
                        onClick={() => {
                          setData(record);
                          setModalEditor(true);
                        }}
                      />
                    </Tooltip>
                  )}
                  {["2-tu-choi", "1-duyet", null].includes(record.trang_thai) && (
                    <Tooltip title="Xem">
                      <Button
                        shape="circle"
                        icon={<EyeOutlined />}
                        type="text"
                        onClick={() => {
                          setData(record);
                          setModalView(true);
                        }}
                      />
                    </Tooltip>
                  )}
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
        <ConfirmDialog
          openModal={modalEditor}
          name={data?.sinh_vien}
          closeModal={setModalEditor}
          setKeyRender={setKeyRender}
          apiConfirm={thuctapApi.duyetThucTap}
          translation={"duyet-thuc-tap"}
          id={data?.id}
          data={data}
          title={"Duyệt phiếu thực tập"}
          options={options}
        />
        <ViewDialog
          openModal={modalView}
          closeModal={setModalView}
          translation={"duyet-thuc-tap"}
          apiConfirm={thuctapApi.duyetThucTap}
          title={"Xem phiếu thực tập"}
          optionsView={optionsView}
          id={data?.id}
          setKeyRender={setKeyRender}
          backAgree={data?.trang_thai == "1-duyet" ? true : false}
        />
        <ModalExportThucTap
          translation="duyet-thuc-tap"
          showModal={modalExport}
          setShowModal={setModalExport}
          api={thuctapApi.excelThucTap}
          data={data}
          text="danh-sach-thuc-tap"
        />
      </>
    );
  }

  return (
    <PageContainer
      title="Danh sách phiếu thực tập"
      extraTitle={
        <Space style={{ float: "right" }}>
          <Button onClick={() => setModalExport(true)} type="primary">
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
