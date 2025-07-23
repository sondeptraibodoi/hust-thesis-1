import monHocApi from "@/api/mon-hoc/monHoc.api";
import giaoVienApi from "@/api/giaoVien/giaoVien.api";
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
  TeamOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import phanCongApi from "@/api/phanCong/phanCong.api";

const PhanCongPage = () => {
  const {id} = useParams();
  const [giaoVien, setGiaoVien] = useState([]);
  const [data, setData] = useState();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [keyRender, setKeyRender] = useState(1);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { currentUser } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    const getGiaoVien = async () => {
      const res = await giaoVienApi.list();
      if (res.status === 200) setGiaoVien(res.data.list);
    };
    getGiaoVien();
  }, []);

  const option = [
    {
      rule: [{required: true}],
      type: "select",
      name: "giao_vien_id",
      label: "Giáo viên",
       mode: (!isEdit ? 'multiple' : undefined) as 'multiple' | 'tags' | undefined,
      placeholder: "Vui lòng chọn giáo viên",
      children: giaoVien.map((x:any) => {
        return {
          value: x.id,
          title: x.email + ' - ' + x.ho_ten
        };
      })
    }
  ];

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Mã môn",
      field: "mon_hoc.ma",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Tên môn học",
      field: "mon_hoc.ten_mon_hoc",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Tên giáo viên",
      field: "giao_vien.ho_ten",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
    },
    {
      headerName: "Email",
      field: "giao_vien.email",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
    },
    {
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      width: 200,
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
      title="Phân công môn"
      extraTitle={
        currentUser?.vai_tro === "admin" ? (
          <Button
            onClick={() => {
              setIsEdit(false), setModalEditor(true);
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
        api={(params) =>phanCongApi.list({...params, mon_hoc_id: id})}
      />
      <CreateNEditDialog
        data={data}
        disableSubTitle
        setKeyRender={setKeyRender}
        isEdit={isEdit}
        apiCreate={(data: any) => phanCongApi.create({ ...data, mon_hoc_id: id })}
        apiEdit={(data: any) => phanCongApi.edit(data)}
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

export default PhanCongPage;

const ActionRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  if (!data) return;
  return (
    <>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? "hidden" : ""} title="Sửa">
        <Button type="text" icon={<EditOutlined />} onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? "hidden" : ""} title="Xóa">
        <Button type="text" icon={<DeleteOutlined />} onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
