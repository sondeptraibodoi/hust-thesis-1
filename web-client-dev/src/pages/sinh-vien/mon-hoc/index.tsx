import monHocApi from "@/api/mon-hoc/monHoc.api";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tag, Tooltip } from "antd";
import { FC, useState } from "react";

const subjectStatusMap: Record<string, { color: string; label: string }> = {
  dang_mo: { color: "green", label: "Mở đăng ký" },
  da_dong: { color: "default", label: "Đóng đăng ký" }
};

const MonHocPage = () => {
  const [data, setData] = useState<any>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [keyRender, setKeyRender] = useState(1);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { currentUser } = useAppSelector((state: RootState) => state.auth);

  const option = [
    {
      required: true,
      type: "input",
      name: "ma",
      label: "Mã môn",
      placeholder: "Vui lòng nhập mã môn"
    },
    {
      required: true,
      type: "input",
      name: "ten_mon_hoc",
      label: "Tên môn học",
      placeholder: "Vui lòng nhập tên môn học"
    },
    {
      type: "select",
      name: "trang_thai",
      label: "Trạng thái đăng ký",
      placeholder: "Chọn trạng thái",
      initialValue: "dang_mo",
      children: [
        { value: "dang_mo", title: "Mở đăng ký" },
        { value: "da_dong", title: "Đóng đăng ký" }
      ]
    }
  ];

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Mã môn",
      field: "ma",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Tên môn học",
      field: "ten_mon_hoc",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Trạng thái",
      field: "trang_thai",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: ({ value }: any) => {
        const status = subjectStatusMap[value] ?? subjectStatusMap.da_dong;
        return <Tag color={status.color}>{status.label}</Tag>;
      }
    },
    {
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      width: 140,
      cellRendererParams: {
        onUpdateItem: (item: any) => {
          setData(item);
          setModalEditor(true);
          setIsEdit(true);
        },
        onDeleteItem: (item: any) => {
          setData(item);
          setIsModalDelete(true);
        },
        render: () => {
          setKeyRender(Math.random());
        }
      }
    }
  ]);

  return (
    <PageContainer
      title="Danh sách môn học"
      extraTitle={
        currentUser?.vai_tro === "admin" ? (
          <Button
            onClick={() => {
              setData(undefined);
              setIsEdit(false);
              setModalEditor(true);
            }}
            type="primary"
            style={{ float: "right", marginTop: "20px" }}
          >
            Thêm mới
          </Button>
        ) : (
          <div></div>
        )
      }
    >
      <BaseTable
        gridOption={{
          defaultColDef: {
            flex: 1,
            resizable: true
          }
        }}
        key={keyRender}
        columns={columnDefs}
        api={monHocApi.list}
      />
      <CreateNEditDialog
        data={data}
        disableSubTitle
        setKeyRender={setKeyRender}
        isEdit={isEdit}
        apiCreate={(formData: any) => monHocApi.create({ ...formData })}
        apiEdit={(formData: any) => monHocApi.edit(formData)}
        options={option}
        openModal={modalEditor}
        closeModal={setModalEditor}
      />
      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          closeModal={setIsModalDelete}
          name={"môn học"}
          apiDelete={() => data && monHocApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      )}
    </PageContainer>
  );
};

export default MonHocPage;

const ActionRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);

  if (!data || currentUser?.vai_tro !== "admin") {
    return null;
  }

  return (
    <>
      <Tooltip title="Sửa">
        <Button type="text" icon={<EditOutlined />} onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xóa">
        <Button type="text" icon={<DeleteOutlined />} onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
