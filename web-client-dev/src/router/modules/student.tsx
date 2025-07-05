// import configApi from "@/api/config.api";
import PageTitle from "@/Layout/PageTitle";
import { Children, lazy } from "react";
import { Navigate } from "react-router-dom";

//lop hoc
const MonHocPage = lazy(() => import("@/pages/sinh-vien/mon-hoc"));
const BangDiemPage = lazy(() => import("@/pages/sinh-vien/bang-diem"));
const KiemTraPage = lazy(() => import("@/pages/sinh-vien/kiem-tra"));
const DanhGiaPage = lazy(() => import("@/pages/sinh-vien/danh-gia-nang-luc"));
const FormKiemTra = lazy(() => import("@/pages/sinh-vien/kiem-tra/form"));

export const StudentRoute = [
  {
    path: "",
    element: <Navigate to="mon-hoc" />
  },
  {
    path: "sinh-vien/mon-hoc",
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
            <PageTitle title="Chi tiết" />
            <KiemTraPage />
          </>
        )
      }
    ]
  },
  {
    path: "kiem-tra/:id",
    element: (
      <>
        <PageTitle title="Kiểm tra" />
        <FormKiemTra />
      </>
    )
  },
  {
    path: "danh-gia-nang-luc/:id",
    element: (
      <>
        <PageTitle title="Đánh giá năng lực" />
        <DanhGiaPage />
      </>
    )
  },
  {
    path: "diem-sinh-vien",
    children: [
      {
        path: "",
        index: true,
        element: (
          <>
            <PageTitle title="Điểm" />
            <BangDiemPage />
          </>
        )
      },
    ]
  }
];
