import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import BaseTable from "@/components/base-table";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

const BangDiemPage = () => {
  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Ngày thi",
      field: "created_at",
      filter: "agDateColumnFilter",
      floatingFilter: true,
      cellRenderer: (x: any) => {
        return DateFormat(x.data, "created_at");
      }
    },
    {
      headerName: "Mã đề thi",
      field: "de_thi.code",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Loại",
      field: "de_thi.loai_thi.ten_loai",
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
      headerName: "Số câu hỏi",
      field: "de_thi.tong_so_cau_hoi",
      filter: "agNumberColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Điểm",
      field: "diem",
      filter: "agNumberColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Điểm đạt",
      field: "de_thi.diem_dat",
      filter: "agNumberColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Độ khó bài thi",
      field: "de_thi.diem_toi_da",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if (!params || !params.data) return "";
        return "Mức độ " + params.data.de_thi.do_kho;
      }
    },
    {
      headerName: "Hành động",
      floatingFilter: false,
      pinned: 'right',
      cellRenderer: ActionRender
    }
  ]);
  return (
    <PageContainer title="Danh sách môn">
      <BaseTable
        gridOption={{
          defaultColDef: {
            flex: 1,
            resizable: true
          }
        }}
        columns={columnDefs}
        api={bangDiemApi.list}
      />
    </PageContainer>
  );
};

export default BangDiemPage;

const DateFormat: FC<any> = (data) => {
  if (!data) {
    return <span></span>;
  }
  const formattedDate = dayjs(data.created_at).format("DD/MM/YYYY");
  return <>{<span>{formattedDate}</span>}</>;
};

const ActionRender: FC<any> = ({ data }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  if (!data) return;
  return (
    <>
    <Tooltip className={currentUser?.vai_tro !== "sinh_vien" ? 'hidden' : ""} title="Làm bài thi">
        <Button onClick={() => navigate(`${data.id}`)} type="text" icon={<InfoCircleOutlined />} />
      </Tooltip>

    </>
  );
};
