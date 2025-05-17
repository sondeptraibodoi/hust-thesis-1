import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/store.ts";
import configReducer from "./features/config/store.ts";
import tableReducer from "./features/table/store.ts";

const rootReducer = combineReducers({
  auth: authReducer,
  config: configReducer,
  table: tableReducer
});
const store = configureStore({
  reducer: rootReducer
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
