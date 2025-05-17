import giaoVienApi from "@/api/user/giaoVien.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { GiaoVien } from "@/interface/giaoVien";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Space, Spin, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const TeacherManagementPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <TeacherManagementPageDesktop />;
  const contentMobile = () => <TeacherManagementPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default TeacherManagementPage;

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
const TeacherManagementPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("giao-vien");
  const [data, setData] = useState<GiaoVien>();
  const [columnDefs] = useState<ColDef<GiaoVien & ActionField>[]>([
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
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: GiaoVien) => {
          setData(item);
          setIsModalEdit(true);
          setIsEdit(true);
        },
        onDeleteItem: (item: GiaoVien) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false
    }
  ]);
  const optionsCreate = [
    {
      type: "input",
      name: "name",
      placeholder: t("required.ten"),
      label: t("hint.ten"),
      rule: [
        {
          require: true,
          message: t("required.ten")
        }
      ]
    },
    {
      type: "input",
      name: "email",
      placeholder: t("required.email"),
      label: t("hint.email"),
      rule: [
        {
          require: true,
          message: t("required.email")
        }
      ]
    },
    {
      type: "password",
      name: "password",
      placeholder: t("required.password"),
      label: t("hint.password"),
      rule: [
        {
          require: true,
          message: t("required.password")
        }
      ]
    },
    {
      type: "password",
      name: "confirm",
      placeholder: t("required.confirmPass"),
      label: t("hint.confirmPass"),
      dependencies: "password",
      rule: [
        {
          require: true,
          message: t("required.confirmPass")
        },
        ({ getFieldValue }: any) => ({
          validator(_: any, value: any) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(t("message.not_confirm")));
          }
        })
      ]
    }
  ];
  const optionsEdit = [
    {
      type: "input",
      name: "name",
      placeholder: t("required.ten"),
      label: t("hint.ten"),
      rule: [
        {
          require: true,
          message: t("required.ten")
        }
      ]
    },
    {
      type: "input",
      name: "email",
      placeholder: t("required.email"),
      label: t("hint.email"),
      rule: [
        {
          require: true,
          message: t("required.email")
        }
      ]
    }
  ];
  return (
    <>
      <PageContainer
        title="Quản lý giảng viên"
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
          api={giaoVienApi.list}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <CreateNEditDialog
        apiCreate={giaoVienApi.create}
        apiEdit={giaoVienApi.edit}
        options={isEdit == true ? optionsEdit : optionsCreate}
        translation={"giao-vien"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        closeModal={setIsModalEdit}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="giao-vien"
        closeModal={setIsModalDelete}
        name={data?.name}
        apiDelete={() => data && giaoVienApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

const TeacherManagementPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<GiaoVien[]>([]);
  const [data, setData] = useState<GiaoVien>();
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { t } = useTranslation("giao-vien");

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
  const optionsCreate = [
    {
      type: "input",
      name: "name",
      placeholder: t("required.ten"),
      label: t("hint.ten"),
      rule: [
        {
          require: true,
          message: t("required.ten")
        }
      ]
    },
    {
      type: "input",
      name: "email",
      placeholder: t("required.email"),
      label: t("hint.email"),
      rule: [
        {
          require: true,
          message: t("required.email")
        }
      ]
    },
    {
      type: "password",
      name: "password",
      placeholder: t("required.password"),
      label: t("hint.password"),
      rule: [
        {
          require: true,
          message: t("required.password")
        }
      ]
    },
    {
      type: "password",
      name: "confirm",
      placeholder: t("required.confirmPass"),
      label: t("hint.confirmPass"),
      dependencies: "password",
      rule: [
        {
          require: true,
          message: t("required.confirmPass")
        },
        ({ getFieldValue }: any) => ({
          validator(_: any, value: any) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(t("message.not_confirm")));
          }
        })
      ]
    }
  ];
  const optionsEdit = [
    {
      type: "input",
      name: "name",
      placeholder: t("required.ten"),
      label: t("hint.ten"),
      rule: [
        {
          require: true,
          message: t("required.ten")
        }
      ]
    },
    {
      type: "input",
      name: "email",
      placeholder: t("required.email"),
      label: t("hint.email"),
      rule: [
        {
          require: true,
          message: t("required.email")
        }
      ]
    }
  ];
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await giaoVienApi.list(filter);
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
        name: {
          filterType: "text",
          type: "contains",
          filter: filter.name
        },
        email: {
          filterType: "text",
          type: "contains",
          filter: filter.email
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
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="name" label="Tên giảng viên">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("name", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có giảng viên nào</div>;
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
                  <strong>Tên giảng viên:</strong> {record.name}
                </p>
                <p className="my-1">
                  <strong>Email:</strong> {record.email}
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
          apiCreate={giaoVienApi.create}
          apiEdit={giaoVienApi.edit}
          options={isEdit == true ? optionsEdit : optionsCreate}
          translation={"giao-vien"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          closeModal={setIsModalEdit}
        />
        <DeleteDialog
          openModal={isModalDelete}
          translation="giao-vien"
          closeModal={setIsModalDelete}
          name={data?.name}
          apiDelete={() => data && giaoVienApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý giảng viên"
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
