import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { FC, useCallback } from "react";

import { AgGridReact } from "ag-grid-react";
import { CellEditingStoppedEvent } from "ag-grid-community";
import { GhiChuCellRender } from "./diem-ghi-chu";
import { DiemCellRender } from "./table-diem";

const defaultColDef = {
  flex: 1,
  minWidth: 200,
  resizable: true,
  editable: true
};
interface Props {
  diemData: any;
  setDiemEdit: (value: any) => void;
  showExtraInfo?: boolean;
}
const DiemNhapExcel: FC<Props> = ({ diemData, setDiemEdit, showExtraInfo }) => {
  const columExcel: any[] = [
    {
      field: "stt",
      headerName: "STT",
      sortable: true,
      valueGetter: (params: any) => (params.data.stt ? parseInt(params.data.stt) : ""),
      editable: false
    },
    {
      field: "mssv",
      headerName: "Mã sinh viên",
      valueGetter: (params: any) => (params.data.mssv ? params.data.mssv : ""),
      editable: false
    },
    {
      field: "name",
      headerName: "Tên",
      editable: false
    },
    {
      field: "diem",
      cellRenderer: DiemCellRender,
      headerName: "Điểm"
    }
  ];
  if (showExtraInfo) {
    columExcel.push({
      field: "ghi_chu",
      headerName: "Ghi chú",
      sortable: true,
      editable: false,
      cellRenderer: GhiChuCellRender,
      cellRendererParams: {
        showExtraInfo
      }
    });
  }
  const onCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent) => {
      setDiemEdit((state: any) => {
        if (!state || state.length === 0) {
          state = diemData.diem;
        }

        const updatedDiem = state.map((itemA: any) => {
          if (itemA.sinh_vien_id == event.data.sinh_vien_id) {
            return { ...event.data, stt: Number(event.data.stt), edit: true };
          }
          return itemA;
        });
        return updatedDiem;
      });
    },
    [diemData]
  );
  const getRowStyle = (params: any) => {
    if (params.data.diem === null) {
      return { background: "yellow" };
    }
    return { background: "white" };
  };
  return (
    <AgGridReact
      className="ag-theme-alpine bang_diem_ag"
      rowData={diemData.diem}
      defaultColDef={defaultColDef}
      enableCellTextSelection
      columnDefs={columExcel}
      onCellEditingStopped={onCellEditingStopped}
      getRowStyle={getRowStyle}
    ></AgGridReact>
  );
};

export default DiemNhapExcel;
