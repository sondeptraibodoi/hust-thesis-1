import userApi from "@/api/admin/user.api";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";

import SelectFilterAggrid from "@/components/custom-filter/SelectFilterAggrid";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { ActionField } from "@/interface/common";
import { ROLE } from "@/interface/user";
import PageContainer from "@/Layout/PageContainer";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import { DeleteOutlined, EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { App, Button, Space, Tag, Tooltip } from "antd";
import { FC, useState } from "react";

const defaultColDef = {
  flex: 1,
  resizable: true,
  floatingFilter: true,
  filterParams: {
    buttons: ["reset", "apply"]
  }
};

const active = [
  {
    value: true,
    label: "Hoạt động"
  },
  {
    value: false,
    label: "Chặn"
  }
];

const roleoption = [
  {
    value: ROLE.admin,
    label: "Quản trị"
  },
  {
    value: ROLE.teacher,
    label: "Giảng viên"
  },
  {
    value: ROLE.student,
    label: "Sinh viên"
  }
];
const UserPage: React.FC = () => {
  const [data, setData] = useState<any>();
  const [isEdit, setIsEdit] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Họ tên",
      field: "ho_ten",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      valueGetter: ({data}) => {
        console.log("🚀 ~ data:", data)
        if(!data || !data.info) return;
        return data.info.ho_ten;
      }
    },
    {
      headerName: "Email",
      field: "email",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Vai trò",
      field: "vai_tro",
      filter: SelectFilterAggrid,
      floatingFilter: true,
      cellRenderer: RoleCellRender,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        placeholder: "Vai trò",
        data: roleoption
      }
    },
    {
      headerName: "Trạng thái",
      field: "trang_thai",
      filter: SelectFilterAggrid,
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        placeholder: "Trạng thái",
        data: active
      },
      cellRenderer: ActiveCellRender
    },
    {
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      width: 170,
      cellRendererParams: {
        onUpdateItem: (item: any) => {
          setData(item);
          setIsModalEdit(true);
          setIsEdit(true);
        },
        onDeleteItem: (item: any) => {
          setData(item);
          setIsModalDelete(true);
        },
        render: () => {
          setKeyRender(Math.random())
        }
      }
    }
  ]);

  const optionsCreate = [
    {
      type: "input",
      name: "email",
      placeholder: "Vui lòng nhập email",
      label: "Email",
      rule: [
        {
          required: true,
          message: "Email không được để trống"
        },
        {
          type: "email",
          message: "Email không hợp lệ"
        }
      ]
    },
    {
      type: "input",
      name: "ho_ten",
      placeholder: "Vui lòng nhập họ tên",
      label: "Họ tên",
      rule: [
        {
          required: true,
          message: "Họ tên không được để trống"
        },
        {
          type: "text",
          message: "Họ tên không hợp lệ"
        }
      ]
    },
    {
      type: "password",
      name: "password",
      placeholder: "Vui lòng nhập mật khẩu",
      label: "Mật khẩu",
      rule: [
        {
          required: true,
          message: "Mật khẩu không được để trống"
        }
      ]
    },
    {
      type: "password",
      name: "confirm",
      placeholder: "Xác nhận lại mật khẩu",
      label: "Xác nhận mật khẩu",
      dependencies: ["password"],
      rule: [
        {
          required: true,
          message: "Bạn cần xác nhận mật khẩu"
        },
        ({ getFieldValue }: any) => ({
          validator(_: any, value: any) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
          }
        })
      ]
    },
    {
      rule: [
        {
          required: true,
          message: "Mật khẩu không được để trống"
        }
      ],
      type: "select",
      name: "vai_tro",
      label: "Vai trò",
      placeholder: "Vui lòng chọn vai trò",
      children: roleoption.map((x) => {
        return {
          value: x.value,
          title: x.label
        };
      })
    }
  ];

  return (
    <PageContainer
      title="Danh sách tài khoản"
      extraTitle={
        <Space style={{ float: "right" }}>
          <Button onClick={() => setIsModalEdit(true)} type="primary">
            Tạo mới
          </Button>
        </Space>
      }
    >
      <BaseTable
        key={keyRender}
        gridOption={{ defaultColDef: defaultColDef }}
        columns={columnDefs}
        api={userApi.list}
      ></BaseTable>
      <CreateNEditDialog
        apiCreate={userApi.create}
        apiEdit={userApi.edit}
        options={isEdit == true ? optionsCreate : optionsCreate}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        closeModal={setIsModalEdit}
      />
      <DeleteDialog
        openModal={isModalDelete}
        closeModal={setIsModalDelete}
        name={"Tài khoản " + data?.ho_ten}
        apiDelete={() => data && userApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </PageContainer>
  );
};

export default UserPage;

const ActionRender: FC<any> = ({ onUpdateItem, onDeleteItem, data, render }) => {
  const { notification: api } = App.useApp();
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const handleActive = async () => {
    try {
       await userApi.setactive({
      id: data.id,
      trang_thai: !data.trang_thai
    })
    api.success({
        message: "Thành công",
        description: "Cập nhật trạng thái thành công"
      })
      render()
    } catch (err) {
      api.error({
        message: "Thất bại",
        description: "Cập nhật trạng thái thất bại"
      })
    }

  }
  if (!data) return;
  return (
    <>
      <Tooltip
        className={currentUser?.vai_tro !== "admin" ? "hidden" : ""}
        title={data.trang_thai ? "Chặn" : "Mở khóa"}
      >
        <Button
          type="text"
          icon={data.trang_thai ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => handleActive()}
        />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? "hidden" : ""} title="Sửa">
        <Button type="text" icon={<EditOutlined />} onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? "hidden" : ""} title="Xóa">
        <Button type="text" icon={<DeleteOutlined />} onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};

const RoleCellRender: FC<any> = ({ data }) => {
  if (!data) return <span />;

  let content = null;
  switch (data.vai_tro) {
    case ROLE.teacher:
      content = <Tag key={ROLE.teacher}>Giảng viên</Tag>;
      break;
    case ROLE.admin:
      content = <Tag key={ROLE.admin}>Quản trị</Tag>;
      break;
    case ROLE.assistant:
      content = <Tag key={ROLE.assistant}>Trợ lý</Tag>;
      break;
    case ROLE.student:
      content = <Tag key={ROLE.student}>Sinh viên</Tag>;
      break;
    case ROLE.hp_assistant:
      content = <Tag key={ROLE.hp_assistant}>Trưởng nhóm chuyên môn</Tag>;
      break;
    case ROLE.hp_office:
      content = <Tag key={ROLE.hp_office}>Trợ lý văn phòng</Tag>;
      break;
    default:
      content = <Tag>Không rõ</Tag>;
  }

  return <>{content}</>;
};

const ActiveCellRender: FC<any> = ({ data }) => {
  if (!data) return <span />;

  let content = null;
  switch (data.trang_thai) {
    case true:
      content = <Tag>Hoạt động</Tag>;
      break;
    case false:
      content = <Tag>Chặn</Tag>;
      break;
  }

  return <>{content}</>;
};
