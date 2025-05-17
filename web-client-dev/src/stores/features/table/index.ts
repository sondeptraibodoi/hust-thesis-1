import { RootState } from "@/stores";
import { createSelector } from "@reduxjs/toolkit";

export { setTableState } from "./store";

export const getTableState = (state: RootState) => state.table.state;

const selectItemId = (_state: RootState, table: string) => table;

export const getTableStateByTable = createSelector([getTableState, selectItemId], (tables, id) => tables[id] || {});
