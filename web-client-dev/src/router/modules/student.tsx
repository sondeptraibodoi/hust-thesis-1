// import configApi from "@/api/config.api";
import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

//lop hoc
const MonHocPage = lazy(() => import("@/pages/sinh-vien/mon-hoc/index.tsx"));
const DanhSachLoiCuaSinhVien = lazy(() => import("@/pages/sinh-vien/bao-loi"));
const LopHocDetailPage = lazy(() => import("@/pages/sinh-vien/lop/detail"));
const BangDiemPage = lazy(() => import("@/pages/sinh-vien/bang-diem"));
const KiemTraPage = lazy(() => import("@/pages/sinh-vien/kiem-tra"))

export const StudentRoute = [
  {
    path: "",
    element: <Navigate to="mon-hoc" />
  },
  {
    path: "mon-hoc",
    children: [
      {
        path: "",
        index: true,
        element: (
          <>
            <PageTitle title="Môn học" />
            <MonHocPage />
          </>
        )
      },
      {
        path: "kiem-tra/:id",
        element: (
          <>
            <PageTitle title="Phòng học chi tiết" />
            <KiemTraPage />
          </>
        )
      }
    ]
  },
  {
    path: "diem-sinh-vien",
    element: (
      <>
        <PageTitle title="Điểm" />
        <BangDiemPage />
      </>
    )
  },
];
