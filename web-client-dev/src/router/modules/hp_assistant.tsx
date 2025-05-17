import { lazy } from "react";
import { RouteObject } from "react-router-dom";

//lop hoc
const HocPhanChuongPage = lazy(() => import("@/pages/tro-ly-hoc-phan/hoc-phan-chuong"));
const HocPhanChuongDetailPage = lazy(() => import("@/pages/tro-ly-hoc-phan/hoc-phan-chuong/detail"));
const DanhSachCauHoiPage = lazy(() => import("@/pages/tro-ly-hoc-phan/cau-hoi"));
const CauHoiDetailPage = lazy(() => import("@/pages/tro-ly-hoc-phan/cau-hoi/detail"));

export const HpAssistantRoute: RouteObject[] = [
  {
    path: "truong-bo-mon",
    children: [
      {
        path: "hoc-phan",
        children: [
          {
            path: "",
            element: <HocPhanChuongPage />
          },
          {
            path: ":id",
            element: <HocPhanChuongDetailPage />
          }
        ]
      },
      {
        path: "cau-hoi",
        children: [
          {
            path: "",
            element: <DanhSachCauHoiPage />
          },
          {
            path: ":id",
            element: <CauHoiDetailPage />
          }
        ]
      }
    ]
  }
];
