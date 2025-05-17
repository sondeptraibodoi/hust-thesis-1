import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { CellEditingStoppedEvent, ColDef, GetRowIdParams, GridApi, GridReadyEvent } from "ag-grid-community";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AgGridReact } from "ag-grid-react";
import { Checkbox } from "antd";
import { GhiChuCellRender } from "./diem-ghi-chu";
import { convertLinkToBackEnd } from "@/utils/url";
import diemLopThiApi from "@/api/bangDiem/diemLopThi.api";
import { useLocation } from "react-router-dom";
import { DiemCellRender } from "./table-diem";
import { useMediaQuery } from "react-responsive";

const defaultColDef = {
  flex: 1,
  resizable: true,
  editable: true
};
interface Diem {
  bang_diem_id?: number;
  diem: 3.14 | number;
  mssv: string;
  page?: number;
  stt: string | number;
  create_at?: string;
  update_at?: string;
}
interface CompareDiem {
  diem_goc: Diem;
  diem_nd: Diem;
  status: number;
}
interface Props {
  diemData?: any;
  setDiemEdit?: (value: any) => void;
  setCountDiemSai?: (value: number) => void;
  idLopThiNhanDien?: number;
  keyRender?: number;
  showExtraInfo?: boolean;
  activeFunc?: boolean;
}

const baseApi = convertLinkToBackEnd("/sohoa/api");

const DiemNhanDien: FC<Props> = ({
  diemData,
  setDiemEdit,
  setCountDiemSai,
  idLopThiNhanDien,
  keyRender,
  showExtraInfo,
  activeFunc
}) => {
  const gridApi = useRef<GridApi>();
  const loca = useLocation();
  const path = loca.pathname.split("/");
  const [diemCompare, setDiemCompare] = useState<CompareDiem[]>([]);
  const [diemNhanDien, setDiemNhanDien] = useState<Diem[]>([]);
  const [columnDefs, setColumDefs] = useState<ColDef[]>([]);
  const lopThiId = path[path.length - 1];
  const [conFirmData, setConFirmData] = useState<CompareDiem>();
  const [count, setCount] = useState(0);
  const [key, setKey] = useState(0);
  const columNhanDien = useMemo(
    () => [
      {
        field: "stt",
        headerName: "STT",
        sortable: true,
        maxWidth: 100,
        valueGetter: (params: any) => (params.data.diem_goc ? parseInt(params.data.diem_goc.stt) : ""),
        editable: false
      },
      {
        field: "mssv",
        headerName: "MSSV",
        maxWidth: 200,
        valueGetter: (params: any) => (params.data.diem_goc ? params.data.diem_goc.mssv : ""),
        editable: false
      },
      {
        field: "diem_goc.diem",
        headerName: "Điểm",
        valueGetter: (params: any) => {
          if (params.data.diem_goc.diem === "-" || params.data.diem_goc.diem < 0) {
            return "-";
          }
          if (parseFloat(params.data.diem_goc.diem) >= 0) {
            return params.data.diem_goc.diem;
          }
          if (params.data.diem_nd === null || params.data.diem_goc.diem.trim() === "") {
            return "-";
          }
        }
      },
      {
        colId: "status",
        field: "status",
        headerName: "Xác nhận",
        cellRenderer: ConfirmCellRender,
        cellRendererParams: {
          setValue: setConFirmData
        },
        editable: false
      }
    ],
    []
  );
  const columHadDiem = useMemo(() => {
    const res: ColDef[] = [
      {
        field: "stt",
        headerName: "STT",
        sortable: true,
        maxWidth: 100,
        editable: false
      },
      {
        field: "mssv",
        headerName: "MSSV",
        sortable: true,
        editable: false
      },
      {
        field: "diem",
        headerName: "Điểm",
        sortable: true,
        cellRenderer: DiemCellRender,
        cellRendererParams: {
          showExtraInfo
        }
      }
    ];
    if (showExtraInfo) {
      res.push({
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
    return res;
  }, [showExtraInfo]);

  const getDiemNhanDien = async () => {
    try {
      const res = await diemLopThiApi.nhanDienList({
        id: idLopThiNhanDien ? idLopThiNhanDien : lopThiId
      });
      setDiemNhanDien(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const compareDiem = (diemNhanDien: Diem[], diemData: any) => {
    const diem_cache: any[] = [];
    let count = 0;
    if (diemNhanDien.length === 0) {
      const mergeArr = diemData.diem.map((init: Diem) => {
        count++;
        const diem_goc = { ...init, diem: 0 };
        diem_cache.push(diem_goc);
        return {
          diem_goc,
          diem_nd: null,
          status: 1
        };
      });
      setDiemCompare(mergeArr);
      setDiemEdit && setDiemEdit(diem_cache);
      setCount(count);
      setCountDiemSai && setCountDiemSai(count);
      return;
    }
    // lấy dữ liệu bảng nhận diện và điền vào bảng điểm
    const mergeArr = diemData.diem.map((init: Diem) => {
      const itemMatching = diemNhanDien.find((itemA) => Number(itemA.mssv) === Number(init.mssv));
      const diem_goc = itemMatching ? { ...init, diem: itemMatching.diem || -1 } : { ...init, diem: -1 };
      diem_cache.push(diem_goc);
      const status = Number(diem_goc.stt) === Number(itemMatching?.stt) ? 0 : 1;
      return {
        diem_goc,
        diem_nd: itemMatching || null,
        status
      };
    });

    // tìm những sinh viên sai mssv và stt
    const diem_sai = diemData.diem.filter(
      (item: Diem) => !diemNhanDien.some((item2: Diem) => item2.mssv !== item.mssv && item2.stt !== item.stt)
    );

    if (diem_sai.length > 0) {
      diem_sai.forEach((itemA: Diem) => {
        mergeArr.forEach((itemB: CompareDiem) => {
          if (Number(itemA.stt) === Number(itemB.diem_goc.stt)) {
            itemB.diem_goc.diem = 0;
            itemB.status = 2;
          }
        });
      });
    }
    mergeArr.forEach((item: CompareDiem) => {
      if (item.status !== 0) count++;
    });

    setDiemCompare(mergeArr);
    setDiemEdit && setDiemEdit(diem_cache);
    setCount(count);
    setCountDiemSai && setCountDiemSai(count);
    setKey((state) => ++state);
  };
  useEffect(() => {
    if (gridApi.current) {
      gridApi.current.redrawRows();
    }
  }, [key, gridApi]);

  const onCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent) => {
      if (!diemData.had_diem) {
        if (event.rowIndex != null) {
          setDiemCompare((state) => {
            if (event.rowIndex != null) {
              state[event.rowIndex] = {
                ...state[event.rowIndex],
                status: 0
              };
            }
            return [...state];
          });
          setCountDiemSai && setCountDiemSai(diemCompare.filter((x) => x.status != 0).length);
        }
        const updatedDiem = diemCompare.map((itemA: CompareDiem) => {
          if (itemA.diem_goc.mssv === event.data.diem_goc.mssv) {
            return {
              ...event.data.diem_goc,
              stt: Number(event.data.diem_goc.stt)
            };
          }
          return { ...itemA.diem_goc, status: 1 };
        });
        // setDiemCompare((pre)=> ([...pre,pre[indexChange] = {...pre[indexChange],status:0}]))
        setDiemEdit && setDiemEdit(updatedDiem);
      } else {
        const updatedDiem = diemData.diem.map((itemA: Diem) => {
          if (itemA.mssv === event.data.mssv) {
            return {
              ...event.data,
              stt: Number(event.data.stt)
            };
          }
          return { ...itemA, status: 1 };
        });
        setDiemEdit && setDiemEdit(updatedDiem);
      }
      const rowData: any[] = [];
      event.api.forEachNode((node) => rowData.push(node.data));
      const row = event.node;
      if (row) event.api.redrawRows({ rowNodes: [row] });
    },
    [diemData, diemCompare, gridApi]
  );

  const getRowStyle = (params: any) => {
    if (
      params.data.status === 1 &&
      Number(params.data.diem_nd?.stt) !== Number(params.data.diem_goc?.stt) &&
      !diemData.had_diem
    ) {
      return { background: "#ffff71" };
    }
    // else if (!diemData.had_diem && params.data.status === 2) {
    //   return { background: "yellow" };
    // }
    else if (!diemData.had_diem && params.data.status === 2) {
      return { background: "red" };
    } else {
      return { background: "white" };
    }
  };

  useEffect(() => {
    if (activeFunc) return;
    if (!diemData.had_diem) {
      setColumDefs(columNhanDien);
      getDiemNhanDien();
    } else {
      setColumDefs(columHadDiem);
    }
  }, [idLopThiNhanDien, diemData, activeFunc]);

  useEffect(() => {
    if (activeFunc) return;
    if (diemData.length === 0) return;
    if (!activeFunc && diemData && diemNhanDien.length >= 0 && !diemData.had_diem) {
      compareDiem(diemNhanDien, diemData);
    }
    if (!activeFunc && diemData.had_diem) {
      setDiemCompare(diemData.diem);
    }
  }, [diemData, diemNhanDien, activeFunc]);

  useEffect(() => {
    if (conFirmData) {
      const newDiem = diemCompare.map((item) => {
        if (item.diem_goc.mssv === conFirmData.diem_goc.mssv) {
          return { ...item, status: conFirmData.status };
        } else {
          return item;
        }
      });
      setDiemCompare(newDiem);
      setCountDiemSai && setCountDiemSai(newDiem.filter((x) => x.status != 0).length);
    }
  }, [conFirmData]);

  useEffect(() => {
    setCountDiemSai && setCountDiemSai(count);
  }, [count]);

  const getRowId = useCallback(
    function (params: GetRowIdParams) {
      if (diemData.length === 0) return undefined;
      return diemData.had_diem ? params.data.stt : params.data.diem_goc.stt;
    },
    [diemData]
  );
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApi.current = params.api;
    if (diemCompare && diemCompare.length > 0) params.api.redrawRows();
  }, []);
  const isMobile = useMediaQuery({ minWidth: 600 });
  return (
    <div className={isMobile ? "flex gap-4" : "block"}>
      <div className="col-span-1 flex-1 pdf">
        <iframe
          key={keyRender}
          className="w-full"
          src={`${baseApi}/bang-diem/show-slice-pdf/${idLopThiNhanDien ? idLopThiNhanDien : path[path.length - 1]}`}
        ></iframe>
      </div>
      <div className={isMobile ? "flex-1 bang_diem_ag" : "flex-1 bang_diem_ag my-4"}>
        <AgGridReact
          className="ag-theme-alpine h-full"
          rowData={diemCompare}
          defaultColDef={defaultColDef}
          enableCellTextSelection
          columnDefs={columnDefs}
          onCellEditingStopped={onCellEditingStopped}
          getRowStyle={getRowStyle}
          getRowId={getRowId}
          onGridReady={onGridReady}
          localeText={{ noRowsToShow: "Không có điểm của sinh viên nào" }}
        ></AgGridReact>
      </div>
    </div>
  );
};

export default DiemNhanDien;
const ConfirmCellRender: FC<{
  data: CompareDiem;
  setValue: (data: CompareDiem) => void;
}> = ({ data, setValue }) => {
  const [newData, setNewData] = useState<CompareDiem>();
  const handleCheckboxChange = (e: any) => {
    const dataChange = { ...data, status: e.target.checked ? 0 : 2 };
    setNewData(dataChange);
    setValue(dataChange);
  };

  return <Checkbox checked={newData ? newData.status === 0 : data.status === 0} onChange={handleCheckboxChange} />;
};
