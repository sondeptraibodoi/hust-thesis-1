import { sinhVienApi } from "@/api/user/sinhvien.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { SinhVien } from "@/interface/user";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Space, Spin, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
const SinhVienPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <SinhVienPageDesktop />;
  const contentMobile = () => <SinhVienPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default SinhVienPage;

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};

const DateFormat: FC<any> = (data) => {
  if (!data) {
    return <span></span>;
  }
  if (!data.birthday) {
    return <span></span>;
  }
  const formattedDate = dayjs(data.birthday).format("DD/MM/YYYY");
  return <>{<span>{formattedDate}</span>}</>;
};

const SinhVienPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("sinh-vien");
  const [data, setData] = useState<SinhVien>();
  const [columnDefs] = useState<ColDef<SinhVien & ActionField>[]>([
    {
      headerName: t("field.name"),
      field: "name",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.email"),
      field: "email",
      filter: "agTextColumnFilter"
    },

    {
      headerName: t("field.mssv"),
      field: "mssv",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.birthday"),
      field: "birthday",
      filter: "agDateColumnFilter",
      cellRenderer: (x: any) => {
        return DateFormat(x.data, "birthday");
      }
    },
    {
      headerName: t("field.group"),
      field: "group",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 200,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: SinhVien) => {
          const res = Object.assign({}, item);
          if (item.birthday) {
            res.birthday = dayjs(item.birthday).tz("Asia/Ho_Chi_Minh");
          }
          setData(res);
          setIsModalEdit(true);
          setIsEdit(true);
        },
        onDeleteItem: (item: SinhVien) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false
    }
  ]);
  const options = [
    {
      type: "input",
      name: "name",
      placeholder: "Nhập tên sinh viên",
      label: "Tên sinh viên",
      rule: [
        {
          required: true,
          message: t("required.name")
        }
      ]
    },
    {
      type: "input",
      name: "email",
      placeholder: "Nhập email",
      label: "Email"
    },
    {
      type: "input",
      name: "mssv",
      placeholder: "Nhập mã sinh viên",
      label: "MSSV",
      rule: [
        {
          required: true,
          message: t("required.mssv")
        }
      ]
    },
    {
      type: "datepicker",
      name: "birthday",
      placeholder: "Ngày Sinh",
      label: "Ngày Sinh",
      timeFomat: "DD/MM/YYYY"
    },
    {
      type: "input",
      name: "group",
      placeholder: "Lớp",
      label: "Lớp"
    }
  ];
  return (
    <>
      <PageContainer
        title="Quản lý sinh viên"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button onClick={() => setIsModalEdit(true)} type="primary">
              {t("action.create_new")}
            </Button>
          </Space>
        }
      >
        <BaseTable
          key={keyRender}
          columns={columnDefs}
          api={sinhVienApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <CreateNEditDialog
        apiCreate={sinhVienApi.create}
        apiEdit={sinhVienApi.edit}
        options={options}
        translation={"sinh-vien"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        closeModal={setIsModalEdit}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="sinh-vien"
        closeModal={setIsModalDelete}
        name={data?.name}
        apiDelete={() => data && sinhVienApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

const SinhVienPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [data, setData] = useState<SinhVien>();
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { t } = useTranslation("sinh-vien");

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
  const options = [
    {
      type: "input",
      name: "name",
      placeholder: "Nhập tên sinh viên",
      label: "Tên sinh viên",
      rule: [
        {
          required: true,
          message: t("required.name")
        }
      ]
    },
    {
      type: "input",
      name: "email",
      placeholder: "Nhập email",
      label: "Email"
    },
    {
      type: "input",
      name: "mssv",
      placeholder: "Nhập mã sinh viên",
      label: "MSSV",
      rule: [
        {
          required: true,
          message: t("required.mssv")
        }
      ]
    },
    {
      type: "datepicker",
      name: "birthday",
      placeholder: "Ngày Sinh",
      label: "Ngày Sinh",
      timeFomat: "DD/MM/YYYY"
    },
    {
      type: "input",
      name: "group",
      placeholder: "Lớp",
      label: "Lớp"
    }
  ];

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await sinhVienApi.list(filter);
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
    if (filter.name) {
      sendData.filterModel.name = {
        filterType: "text",
        type: "contains",
        filter: filter.name
      };
    }
    if (filter.email) {
      sendData.filterModel.email = {
        filterType: "text",
        type: "contains",
        filter: filter.email
      };
    }
    if (filter.mssv) {
      sendData.filterModel.mssv = {
        filterType: "text",
        type: "contains",
        filter: filter.mssv
      };
    }
    if (filter.group) {
      sendData.filterModel.group = {
        filterType: "text",
        type: "contains",
        filter: filter.group
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="name" label="Tên sinh viên">
            <Input
              onPressEnter={(e: any) => {
                {
                  pagination.page = 1;
                  handleFieldChanged("name", e.target.value);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="email" label="Email">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("email", e.target.value);
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="group" label="Lớp">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("group", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có sinh viên nào</div>;
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
                  <strong>Tên sinh viên:</strong> {record.name}
                </p>
                <p className="my-1">
                  <strong>Email:</strong> {record.email}
                </p>
                <p className="my-1">
                  <strong>Mã sinh viên:</strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>Ngày sinh:</strong> {DateFormat(record, "birthday")}
                </p>
                <p className="my-1">
                  <strong>Lớp:</strong> {record.group}
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
        <CreateNEditDialog
          apiCreate={sinhVienApi.create}
          apiEdit={sinhVienApi.edit}
          options={options}
          translation={"sinh-vien"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          closeModal={setIsModalEdit}
        />
        <DeleteDialog
          openModal={isModalDelete}
          translation="sinh-vien"
          closeModal={setIsModalDelete}
          name={data?.name}
          apiDelete={() => data && sinhVienApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý sinh viên"
        extraTitle={
          <Button onClick={() => setIsModalEdit(true)} type="primary" style={{ float: "right" }}>
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
