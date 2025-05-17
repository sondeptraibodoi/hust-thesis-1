import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Tag, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import BaseTable from "@/components/base-table";
import { ActionField } from "@/interface/common";
import { ColDef } from "ag-grid-community";
// const { Option } = Select;
// import CreateNEditDialog from "@/components/createNEditDialog";
// import DeleteDialog from "@/components/dialog/deleteDialog";
import exportApi from "@/api/export/export.api";
import phucKhaoApi from "@/api/phucKhao/phucKhao.api";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import EditDialog from "@/components/editDialog";
import ModalExportPK from "@/components/export/export-excel-phucKhao";
import { PhucKhao } from "@/interface/phucKhao";
import PageContainer from "@/Layout/PageContainer";
import { EditOutlined, UnorderedListOutlined } from "@ant-design/icons";

import kiHocApi from "@/api/kiHoc/kiHoc.api";
import BaseResponsive from "@/components/base-responsive";
import { Paginate } from "@/interface/axios";
import { useAppSelector } from "@/stores/hook";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  filter: true,
  floatingFilter: true
};

const statusoption = [
  {
    value: "da_thanh_toan",
    label: "Đã thanh toán"
  },
  {
    value: "chua_thanh_toan",
    label: "Chưa thanh toán"
  },
  {
    value: "qua_han",
    label: "Quá hạn"
  }
];
const PhucKhaoPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <PhucKhaoPageDesktop />;
  const contentMobile = () => <PhucKhaoPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
const PhucKhaoPageDesktop: FC<any> = () => {
  const { t } = useTranslation("phuc-khao");
  const [data, setData] = useState<PhucKhao>();
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  // const [isModalDelete, setIsModalDelete] = useState(false);
  const [modalExportPhucKhao, setModalExportPhucKhao] = useState(false);
  const [keyRender, setKeyRender] = useState(0);

  const [columnDefs] = useState<ColDef<PhucKhao & ActionField>[]>([
    {
      headerName: t("field.mssv"),
      field: "sinh_vien.mssv",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_lop"),
      field: "lop.ma",
      filter: "agTextColumnFilter",
      cellRenderer: MaLopCellRender
    },
    {
      headerName: t("field.ma_lop_thi"),
      field: "lop_thi.ma",
      filter: "agTextColumnFilter",
      cellRenderer: MaLopThiCellRender
    },
    {
      headerName: t("field.ma_thanh_toan"),
      field: "ma_thanh_toan",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai",
      filter: SelectFilter,
      cellRenderer: TrangThaiCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Trạng thái",
        data: statusoption
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: PhucKhao) => {
          setData(item);
          setIsModalEdit(true);
          setIsEdit(true);
        }
      },
      filter: false
    }
  ]);
  const optionsEdit = [
    {
      type: "select",
      name: "trang_thai",
      placeholder: t("required.trang_thai"),
      label: t("hint.trang_thai"),
      required: true,
      children: [
        { value: "da_thanh_toan", title: "Đã thanh toán" },
        { value: "chua_thanh_toan", title: "Chưa thanh toán" },
        { value: "qua_han", title: "Quá hạn" }
      ]
    }
  ];

  return (
    <>
      <PageContainer
        title="Danh sách phúc khảo"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button onClick={() => setModalExportPhucKhao(true)} type="primary">
              Xuất danh sách
            </Button>
          </Space>
        }
      >
        <BaseTable
          key={keyRender}
          columns={columnDefs}
          api={phucKhaoApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <EditDialog
        apiEdit={phucKhaoApi.edit}
        options={optionsEdit}
        translation={"phuc-khao"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        // closeModal={setIsModalEdit}
        closeModal={() => {
          setIsModalEdit(false);
        }}
      />
      <ModalExportPK
        translation="sinh-vien-lop"
        showModal={modalExportPhucKhao}
        setShowModal={setModalExportPhucKhao}
        api={exportApi.excelPhucKhao}
        data={data}
        text="danh-sach-phuc-khao"
      />
      {/* <DeleteDialog
        openModal={isModalDelete}
        translation="bao-loi"
        closeModal={setIsModalDelete}
        // name={data?.tieu_de}
        // apiDelete={() => data && phucKhaoApi.delete(data)}
        setKeyRender={setKeyRender}
      /> */}
    </>
  );
};
const PhucKhaoPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<PhucKhao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [data, setData] = useState<PhucKhao>();
  const { t } = useTranslation("phuc-khao");
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [modalExportPhucKhao, setModalExportPhucKhao] = useState(false);

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
  const optionsEdit = [
    {
      type: "select",
      name: "trang_thai",
      placeholder: t("required.trang_thai"),
      label: t("hint.trang_thai"),
      required: true,
      children: [
        { value: "da_thanh_toan", title: "Đã thanh toán" },
        { value: "chua_thanh_toan", title: "Chưa thanh toán" },
        { value: "qua_han", title: "Quá hạn" }
      ]
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

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await phucKhaoApi.list(filter);
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
        "sinh_vien.mssv": {
          filterType: "text",
          type: "contains",
          filter: filter.mssv
        },
        "lop.ma": {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop
        },
        "lop_thi.ma": {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop_thi
        },
        ma_thanh_toan: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_thanh_toan
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_lop" label="Mã lớp học">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_lop", e.target.value);
              }}
            />
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_thanh_toan" label="Mã thanh toán">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_thanh_toan", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có đơn phúc khảo nào</div>;
  } else {
    Content = (
      <>
        {dataSource.map((record, key) => {
          return (
            <Col span={24} key={record.id} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>STT: </strong> {key + 1}
                </p>
                <p className="my-1">
                  <strong>MSSV: </strong> {record.sinh_vien.mssv}
                </p>
                <p className="my-1">
                  <strong>Kì học: </strong> {record.ki_hoc}
                </p>
                <p className="my-1">
                  <strong>Mã lớp học: </strong> {record.lop.ma}{" "}
                  {
                    <Link to={"/sohoa/lop-hoc/" + record.lop_id} className="mr-2 text-black">
                      <Button shape="circle" type="text">
                        <UnorderedListOutlined />
                      </Button>
                    </Link>
                  }
                </p>
                <p className="my-1">
                  <strong>Mã lớp thi: </strong> {record.lop_thi.ma}{" "}
                  {
                    <Link
                      to={"/sohoa/lop-hoc/" + record.lop_id + "/sinh-vien/" + record.lop_thi_id}
                      className="mr-2 text-black"
                    >
                      <Button shape="circle" type="text">
                        <UnorderedListOutlined />
                      </Button>
                    </Link>
                  }
                </p>
                <p className="my-1">
                  <strong>Mã thanh toán: </strong> {record.ma_thanh_toan}
                </p>
                <p className="my-1">
                  <strong>Trạng thái:</strong>{" "}
                  {record.trang_thai === "da_thanh_toan" ? (
                    <Tag key="da_thanh_toan" color="success">
                      Đã thanh toán
                    </Tag>
                  ) : record.trang_thai === "chua_thanh_toan" ? (
                    <Tag key="da_thanh_toan" color="red">
                      Chưa thanh toán
                    </Tag>
                  ) : record.trang_thai === "qua_han" ? (
                    <Tag key="qua_han" color="red">
                      Quá hạn
                    </Tag>
                  ) : (
                    ""
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
                        setIsModalEdit(true);
                        setIsEdit(true);
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
        <EditDialog
          apiEdit={phucKhaoApi.edit}
          options={optionsEdit}
          translation={"phuc-khao"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          // closeModal={setIsModalEdit}
          closeModal={() => {
            setIsModalEdit(false);
          }}
        />
        <ModalExportPK
          translation="sinh-vien-lop"
          showModal={modalExportPhucKhao}
          setShowModal={setModalExportPhucKhao}
          api={exportApi.excelPhucKhao}
          data={data}
          text="danh-sach-phuc-khao"
        />
      </>
    );
  }

  return (
    <PageContainer
      title="Danh sách phúc khảo"
      extraTitle={
        <Space style={{ float: "right" }}>
          <Button onClick={() => setModalExportPhucKhao(true)} type="primary">
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

export default PhucKhaoPage;

const ActionCellRender: FC<any> = ({ onUpdateItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
    </>
  );
};

const TrangThaiCellRender: FC<{ data: PhucKhao }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  switch (data.trang_thai) {
    case "da_thanh_toan":
      return (
        <Tag key="da_thanh_toan" color="success">
          Đã thanh toán
        </Tag>
      );
    case "chua_thanh_toan":
      return (
        <Tag key="da_thanh_toan" color="red">
          Chưa thanh toán
        </Tag>
      );
    case "qua_han":
      return (
        <Tag key="qua_han" color="red">
          Quá hạn
        </Tag>
      );
  }
};

const MaLopCellRender: FC<{ data: PhucKhao }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Link to={"/sohoa/lop-hoc/" + data.lop_id} className="mr-2 text-black">
        <Button shape="circle" type="text">
          <UnorderedListOutlined />
        </Button>
      </Link>
      {data.lop.ma}
    </>
  );
};

const MaLopThiCellRender: FC<{ data: PhucKhao }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }

  return (
    <>
      <Link to={"/sohoa/lop-hoc/" + data.lop_id + "/sinh-vien/" + data.lop_thi_id} className="mr-2 text-black">
        <Button shape="circle" type="text">
          <UnorderedListOutlined />
        </Button>
      </Link>
      {data.lop_thi.ma}
    </>
  );
};
