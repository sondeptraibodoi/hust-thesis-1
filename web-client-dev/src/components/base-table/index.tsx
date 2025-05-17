import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styleTableOverwrite.scss";

import { CallbackGetData, DataSource } from "@/hooks/useAgGrid";
import { ApiListReturn, Paginate } from "@/interface/axios";
import { getTableStateByTable, setTableState } from "@/stores/features/table";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import { ReloadOutlined } from "@ant-design/icons";
import {
  ApplyColumnStateParams,
  ColDef,
  // GridOptions,
  GetLocaleTextParams,
  GridApi,
  GridReadyEvent,
  IGetRowsParams
} from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Button, Pagination, type PaginationProps } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { CustomDateComponent } from "./custom/field-date";
const components = { agDateInput: CustomDateComponent };
const defaultColDef: ColDef = {
  minWidth: 150,
  resizable: true,
  rowDrag: false,
  suppressMovable: true,
  filterParams: {
    buttons: ["reset", "apply"]
  },
  suppressMenu: true
};
const BaseTable: FC<{
  columns: ColDef[];
  api: CallbackGetData;
  gridOption?: AgGridReactProps;
  paginationOption?: PaginationProps;
  defaultParams?: object;
  initFilter?: object;
  getRowStyle?: any;
  getRowClass?: any;
  cacheName?: string;
}> = ({
  columns,
  api,
  gridOption = {},
  paginationOption = {},
  defaultParams = {},
  initFilter,
  getRowStyle,
  getRowClass,
  cacheName
}) => {
  const { t } = useTranslation("aggird");
  const location = useLocation();
  const dispatch = useAppDispatch();
  const table_name: any = useMemo(() => {
    if (cacheName) {
      return cacheName;
    } else {
      return location.pathname;
    }
  }, [location]);
  const defaultState = useAppSelector((state) => getTableStateByTable(state, table_name));
  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1,
    ...defaultState?.pagination
  });
  const [isReady, setIsReady] = useState(false);

  const callbackSuccess = useCallback((data: ApiListReturn<any>, params?: IGetRowsParams) => {
    dispatch(
      setTableState({
        table: table_name,
        sortModel: params?.sortModel,
        filterModel: params?.filterModel
      })
    );
    setPagination((state) => {
      return { ...state, ...data.pagination };
    });
  }, []);
  const dataSource = useMemo(
    () => new DataSource<any>(api, callbackSuccess, pagination, defaultParams),

    []
  );
  useEffect(() => {
    dataSource.setGridApi(gridApi.current!);
    gridApi.current?.setDatasource(dataSource);
  }, [isReady]);
  const gridApi = useRef<GridApi>();
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridApi.current = params.api;
      setIsReady(true);
      params.api.setColumnDefs(columns || []);
      if (initFilter) {
        params.api.setFilterModel(initFilter);
      }

      params.api.sizeColumnsToFit();

      if (!defaultState) {
        return;
      }
      if (defaultState.filterModel) {
        params.api.setFilterModel(defaultState.filterModel);
      }
      if (defaultState.sortModel && defaultState.sortModel.length > 0) {
        const columnState: ApplyColumnStateParams = {
          // https://www.ag-grid.com/javascript-grid-column-state/#column-state-interface
          state: defaultState.sortModel
        };
        params.columnApi.applyColumnState(columnState);
      }
    },
    [initFilter, columns, defaultState]
  );

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = useCallback((current: number, pageSize: number) => {
    if (!gridApi.current) {
      return;
    }
    setPagination((state) => {
      return {
        ...state,
        itemsPerPage: pageSize,
        page: current
      };
    });
    dispatch(
      setTableState({
        table: table_name,
        pagination: {
          itemsPerPage: pageSize,
          page: current
        }
      })
    );
    dataSource.setPagination({
      itemsPerPage: pageSize,
      page: current
    });
    gridApi.current?.refreshInfiniteCache();
  }, []);
  const getLocaleText = useCallback(
    (params: GetLocaleTextParams) => {
      return t(params.key);
    },
    [t]
  );

  const onReload = useCallback(() => {
    gridApi.current?.refreshInfiniteCache();
  }, []);
  return (
    <div className="d-flex flex-column full-height full-width pa-4">
      <div className="flex-grow-1 ag-theme-alpine">
        <AgGridReact
          className="full-height full-width"
          overlayLoadingTemplate={
            '<div class="loadingx" style="margin: 7em"></div> <span class="ag-overlay-loading-center " style="font-size: 18px; z-index: 100000"> </span>'
          }
          enableCellTextSelection
          getLocaleText={getLocaleText}
          {...gridOption}
          defaultColDef={{ ...defaultColDef, ...gridOption.defaultColDef }}
          getRowStyle={getRowStyle}
          getRowClass={getRowClass}
          unSortIcon
          rowModelType={"infinite"}
          paginationPageSize={pagination.itemsPerPage}
          cacheBlockSize={0}
          onGridReady={onGridReady}
          columnDefs={columns}
          components={components}
        ></AgGridReact>
      </div>
      <div
        className="flex-grow-0 d-flex align-center"
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
          {...paginationOption}
        />
        <div className="flex-grow-1"></div>
        <div className="px-2">Tổng số: {pagination.total || 0}</div>
        <Button
          shape="circle"
          icon={<ReloadOutlined />}
          type="text"
          onClick={() => {
            onReload();
          }}
        />
      </div>
    </div>
  );
};
export default BaseTable;
