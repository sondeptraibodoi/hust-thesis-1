import { lazy } from "react";
import { RouteObject } from "react-router-dom";

//lop hoc
const SapXepLichTrongThiPage = lazy(() => import("@/pages/SapXepLichTrongThi"));

export const HpOfficeRoute: RouteObject[] = [
  {
    path: "tro-ly-van-phong",
    children: [
      {
        path: "sap-xep-lich-thi",
        element: <SapXepLichTrongThiPage />
      }
    ]
  }
];
