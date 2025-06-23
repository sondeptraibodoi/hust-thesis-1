import monHocApi from "@/api/mon-hoc/monHoc.api";
import BaseTable from "@/components/base-table";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import { DeleteOutlined, EditOutlined, SignatureOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

const MonHocPage = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
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
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      width: 170
    }
  ]);
  return (
    <PageContainer title="Danh sách môn">
      <BaseTable columns={columnDefs} api={monHocApi.list} />
    </PageContainer>
  );
};

export default MonHocPage;

const ActionRender: FC<any> = ({ data }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  if (!data) return;
  return (
    <>
    <Tooltip className={currentUser?.vai_tro !== "sinh_vien" ? 'hidden' : ""} title="Làm bài thi">
        <Button type="text" icon={<SignatureOutlined />} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro === "sinh_vien" ? 'hidden' : ""} title="Danh sách câu hỏi">
        <Button onClick={() => navigate(`${data.id}/cau-hoi`)} type="text" icon={<UnorderedListOutlined />} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? 'hidden' : ""} title='Sửa'>
      <Button type="text" icon={<EditOutlined />} />
      </Tooltip>
      <Tooltip className={currentUser?.vai_tro !== "admin" ? 'hidden' : ""} title='Xóa'>
      <Button type="text" icon={<DeleteOutlined />} />
      </Tooltip>
    </>
  );
};
