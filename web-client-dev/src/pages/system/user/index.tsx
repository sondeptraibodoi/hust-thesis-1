import userApi from "@/api/admin/user.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { ROLE, User } from "@/interface/user/user";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { type ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Tag, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateUser from "./createUser";
import ResetPassword from "./reset-password";
import UpdateUser from "./updateUser";

const defaultColDef = {
  flex: 1,
  resizable: true,
  floatingFilter: true,
  filterParams: {
    buttons: ["reset", "apply"]
  }
};

const roleoption = [
  {
    value: ROLE.admin,
    label: "Quản trị"
  },
  {
    value: ROLE.assistant,
    label: "Trợ lý"
  },
  {
    value: ROLE.teacher,
    label: "Giảng viên"
  },
  {
    value: ROLE.student,
    label: "Sinh viên"
  },
  {
    value: ROLE.hp_assistant,
    label: "Trưởng nhóm chuyên môn"
  },
  {
    value: ROLE.hp_office,
    label: "Trợ lý văn phòng"
  }
];
const UserPage: React.FC = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <UserPageDesktop />;
  const contentMobile = () => <UserPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default UserPage;
const UserPageDesktop: FC<any> = () => {
  const { t } = useTranslation("user-manager-modal");
  const [statusModalDelete, setStatusModalDelete] = useState(false);
  const [valueSelected, setValueSelected] = useState<any>({
    role_code: ROLE.admin
  });
  const [createUserModal, setCreatUserModal] = useState(false);
  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [resetModel, setResetModel] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [columnDefs] = useState<ColDef<User & ActionField>[]>([
    {
      headerName: t("field.username"),
      field: "username",
      sortable: true,
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.role_code"),
      field: "role_code",
      filter: SelectFilter,
      floatingFilter: true,
      cellRenderer: RoleCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Vai trò",
        data: roleoption
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      filter: false,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: User) => {
          setValueSelected(item);
          setUpdateUserModal(true);
          setIsEdit(true);
        },
        onDeleteItem: (item: User) => {
          setValueSelected(item);
          setStatusModalDelete(true);
        },
        onResetPassword: (item: User) => {
          setValueSelected(item);
          setResetModel(true);
        }
      }
    }
  ]);

  return (
    <>
      <PageContainer
        titleTrans={"accountManagement.title"}
        extraTitle={
          <Button
            type="primary"
            onClick={() => {
              setCreatUserModal(true);
            }}
            style={{ float: "right", height: "2.5rem" }}
          >
            {t("action.create_new")}
          </Button>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={userApi.list}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <CreateUser showModal={createUserModal} setShowModal={setCreatUserModal} setKeyRender={setKeyRender}></CreateUser>
      <UpdateUser
        setIsEdit={setIsEdit}
        isEdit={isEdit}
        showModal={updateUserModal}
        setShowModal={setUpdateUserModal}
        data={valueSelected}
        setKeyRender={setKeyRender}
      ></UpdateUser>
      <DeleteDialog
        openModal={statusModalDelete}
        translation="user-manager-modal"
        closeModal={setStatusModalDelete}
        name={valueSelected?.username}
        apiDelete={() => valueSelected && userApi.delete(valueSelected)}
        setKeyRender={setKeyRender}
      />
      <ResetPassword showModal={resetModel} setShowModal={setResetModel} data={valueSelected} />
    </>
  );
};
const UserPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<User[]>([]);
  const { t } = useTranslation("user-manager-modal");
  const [statusModalDelete, setStatusModalDelete] = useState(false);
  const [valueSelected, setValueSelected] = useState<any>({
    role_code: ROLE.admin
  });
  const [createUserModal, setCreatUserModal] = useState(false);
  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [resetModel, setResetModel] = useState(false);

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
      const res = await userApi.list(filter);
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
        username: {
          filterType: "text",
          type: "contains",
          filter: filter.username
        },
        role_code: {
          filterType: "text",
          type: "contains",
          filter: filter.role_code
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="username" label="Tên đăng nhập">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("username", e.target.value);
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="role_code" label="Vai trò">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("role_code", value);
              }}
            >
              {roleoption.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
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
    Content = <div className="p-2 text-center"> Chưa có tài khoản nào</div>;
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
                  <strong>Tên đăng nhập:</strong> {record.username}
                </p>
                <p className="my-1">
                  <strong>Vai trò:</strong>{" "}
                  {record.roles.map((role: string) => {
                    switch (role) {
                      case ROLE.teacher:
                        return <Tag key={ROLE.teacher}>Giảng viên</Tag>;
                      case ROLE.admin:
                        return <Tag key={ROLE.admin}>Quản trị</Tag>;
                      case ROLE.assistant:
                        return <Tag key={ROLE.assistant}>Trợ lý</Tag>;
                      case ROLE.student:
                        return <Tag key={ROLE.student}>Sinh viên</Tag>;
                    }
                  })}
                </p>

                <div className="flex justify-center">
                  <Tooltip title="Tải lại">
                    <Button
                      shape="circle"
                      type="text"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setValueSelected(record);
                        setResetModel(true);
                      }}
                    ></Button>
                  </Tooltip>
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setValueSelected(record);
                        setUpdateUserModal(true);
                        setIsEdit(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Xoá">
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => {
                        setValueSelected(record);
                        setStatusModalDelete(true);
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
        <CreateUser
          showModal={createUserModal}
          setShowModal={setCreatUserModal}
          setKeyRender={setKeyRender}
        ></CreateUser>
        <UpdateUser
          setIsEdit={setIsEdit}
          isEdit={isEdit}
          showModal={updateUserModal}
          setShowModal={setUpdateUserModal}
          data={valueSelected}
          setKeyRender={setKeyRender}
        ></UpdateUser>
        <DeleteDialog
          openModal={statusModalDelete}
          translation="user-manager-modal"
          closeModal={setStatusModalDelete}
          name={valueSelected?.username}
          apiDelete={() => valueSelected && userApi.delete(valueSelected)}
          setKeyRender={setKeyRender}
        />
        <ResetPassword showModal={resetModel} setShowModal={setResetModel} data={valueSelected} />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý tài khoản"
        extraTitle={
          <Button
            type="primary"
            onClick={() => {
              setCreatUserModal(true);
            }}
            style={{ float: "right" }}
          >
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

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data, onResetPassword }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Tải lại">
        <Button shape="circle" type="text" icon={<ReloadOutlined />} onClick={() => onResetPassword(data)}></Button>
      </Tooltip>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
const RoleCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      {data.roles.map((role: string) => {
        switch (role) {
          case ROLE.teacher:
            return <Tag key={ROLE.teacher}>Giảng viên</Tag>;
          case ROLE.admin:
            return <Tag key={ROLE.admin}>Quản trị</Tag>;
          case ROLE.assistant:
            return <Tag key={ROLE.assistant}>Trợ lý</Tag>;
          case ROLE.student:
            return <Tag key={ROLE.student}>Sinh viên</Tag>;
          case ROLE.hp_assistant:
            return <Tag key={ROLE.hp_assistant}>Trưởng nhóm chuyên môn</Tag>;
          case ROLE.hp_office:
            return <Tag key={ROLE.hp_office}>Trợ lý văn phòng</Tag>;
        }
      })}
    </>
  );
};
