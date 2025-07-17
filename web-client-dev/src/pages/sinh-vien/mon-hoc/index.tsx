import monHocApi from "@/api/mon-hoc/monHoc.api";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import {
  DeleteOutlined,
  EditOutlined,
  ExceptionOutlined,
  SignatureOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

const MonHocPage = () => {
  const [data, setData] = useState();
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
      label: "Mã",
      placeholder: "Vui lòng nhập mã môn"
    },
    {
      required: true,
      type: "input",
      name: "ten_mon_hoc",
      label: "Tên môn học",
      placeholder: "Vui lòng nhập tên môn"
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
      headerName: "Số câu hỏi",
      field: "so_cau_hoi",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Cấp độ",
      field: "level",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      hide: currentUser?.vai_tro !== "sinh_vien"
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
      title="Danh sách môn"
      extraTitle={currentUser?.vai_tro === 'admin' ?
        <Button
          onClick={() => {
            setIsEdit(false), setModalEditor(true);
          }}
          type="primary"
          style={{ float: "right", marginTop: "20px" }}
        >
          Thêm mới
        </Button> : <div></div>
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
        apiCreate={(data: any) => monHocApi.create({ ...data })}
        apiEdit={(data: any) => monHocApi.edit(data)}
        options={option}
        openModal={modalEditor}
        closeModal={setModalEditor}
      />
      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          closeModal={setIsModalDelete}
          name={"Câu hỏi"}
          apiDelete={() => data && monHocApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      )}
    </PageContainer>
  );
};

export default MonHocPage;

const ActionRender: FC<any> = ({  onUpdateItem, onDeleteItem, data }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  if (!data) return;
  return (
    <>
      <Tooltip className={currentUser?.vai_tro !== "sinh_vien" ? "hidden" : ""} title="Làm bài thi">
        <Button onClick={() => navigate(`kiem-tra/${data.id}`)} type="text" icon={<SignatureOutlined />} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro === "sinh_vien" ? "hidden" : ""} title="Danh sách đề thi">
        <Button onClick={() => navigate(`${data.id}/de-thi`)} type="text" icon={<ExceptionOutlined />} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro === "sinh_vien" ? "hidden" : ""} title="Danh sách câu hỏi">
        <Button onClick={() => navigate(`${data.id}/cau-hoi`)} type="text" icon={<UnorderedListOutlined />} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? "hidden" : ""} title="Sửa">
        <Button type="text" icon={<EditOutlined />} onClick={() => onUpdateItem(data)}/>
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? "hidden" : ""} title="Xóa">
        <Button type="text" icon={<DeleteOutlined />} onClick={() => onDeleteItem(data)}/>
      </Tooltip>
    </>
  );
};
