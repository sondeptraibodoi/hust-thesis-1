import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

const BangDiemPage = lazy(() => import("@/pages/sinh-vien/bang-diem"));
const KiemTraPage = lazy(() => import("@/pages/sinh-vien/kiem-tra"));
const DanhGiaPage = lazy(() => import("@/pages/sinh-vien/danh-gia-nang-luc"));
const FormKiemTra = lazy(() => import("@/pages/sinh-vien/kiem-tra/form"));
const FormDetailDiem = lazy(() => import("@/pages/sinh-vien/bang-diem/detail"));
const LopPage = lazy(() => import("@/pages/system/lop"));

export const StudentRoute = [
  {
    path: "",
    element: <Navigate to="hoc-vu" replace />
  },
  {
    path: "sinh-vien/mon-hoc",
    element: <Navigate to="../hoc-vu" replace />
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
      {
        path: ":id",
        index: true,
        element: <FormDetailDiem />
      }
    ]
  },
  {
    path: "lop-hoc",
    children: [
      {
        path: "",
        index: true,
        element: (
          <>
            <PageTitle title="Lớp học" />
            <LopPage />
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
  }
];
