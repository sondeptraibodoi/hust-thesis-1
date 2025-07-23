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
  SettingOutlined,
  SignatureOutlined,
  TeamOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import phanCongApi from "@/api/phanCong/phanCong.api";
import lopApi from "@/api/lop/lop.api";

const LopPage = () => {
  const {id} = useParams();
  const [data, setData] = useState();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [keyRender, setKeyRender] = useState(1);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [mon, setMon] = useState<any>([]);

  useEffect(() => {
      const getMon = async () => {
        const res = await monHocApi.list();
        if (res.status === 200) setMon(res.data.list);
      };
      getMon();
    }, []);

  const option = [
    {
      rule: [{required: true}],
      type: "input",
      name: "ten_lop",
      label: "Mã lớp",
      placeholder: "Vui lòng nhập mã lớp",
    },
    {
      rule: [{required: true}],
      type: "select",
      name: "mon_hoc_id",
      label: "Môn học",
      placeholder: "Vui lòng chọn môn",
      children: mon.map((x:any) => {
        return {
          value: x.id,
          title: x.ten_mon_hoc
        };
      })
    },
    {
      rule: [{required: true}],
      type: "input",
      name: "hoc_ky",
      label: "Kỳ học",
      placeholder: "Vui lòng nhập kỳ học",
    },
    {
      rule: [{required: true}],
      type: "input",
      name: "nam_hoc",
      label: "Năm học",
      placeholder: "Vui lòng nhập kỳ học",
    },
  ];

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Mã lớp",
      field: "ten_lop",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Mã môn",
      field: "mon_hoc.ma",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Tên môn",
      field: "mon_hoc.ten_mon_hoc",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Học kỳ",
      field: "hoc_ky",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Năm học",
      field: "nam_hoc",
      filter: "agTextColumnFilter",
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
      title="Danh sách lớp"
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
        api={() =>lopApi.list()}
      />
      <CreateNEditDialog
        data={data}
        disableSubTitle
        setKeyRender={setKeyRender}
        isEdit={isEdit}
        apiCreate={(data: any) => lopApi.create(data)}
        apiEdit={(data: any) => lopApi.edit(data)}
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

export default LopPage;

const ActionRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const nagative = useNavigate();
  if (!data) return;
  return (
    <>
    <Tooltip className={currentUser?.vai_tro !== "sinh_vien" ? "hidden" : ""} title="Làm bài thi">
        <Button onClick={() => nagative(`kiem-tra/${data.id}`)} type="text" icon={<SignatureOutlined />} />
      </Tooltip>
    <Tooltip className={currentUser?.vai_tro === "sinh_vien" ? "hidden" : ""} title="Phân công lớp học">
        <Button type="text" icon={<SettingOutlined />} onClick={() => nagative(`${data.id}`)} />
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
