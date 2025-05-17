// import configApi from "@/api/config.api";
import phucKhaoSinhVienApi from "@/api/phucKhao/phucKhaoSinhVien.api";
import bangDiemApi from "@/api/sinhVien/bangDiem.api";
import thiApi from "@/api/sinhVien/thi.api";
import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

//lop hoc

const LopHocPage = lazy(() => import("@/pages/sinh-vien/lop/index.tsx"));
const LopThiPage = lazy(() => import("@/pages/sinh-vien/lop-thi"));
const DanhSachLoiCuaSinhVien = lazy(() => import("@/pages/sinh-vien/bao-loi"));
const LopHocDetailPage = lazy(() => import("@/pages/sinh-vien/lop/detail"));
const BangDiemPage = lazy(() => import("@/pages/sinh-vien/bang-diem"));
const QrCode = lazy(() => import("@/pages/phuc-khao/qr-code"));
const PhucKhaoForm = lazy(() => import("@/pages/phuc-khao/phuc-khao"));
const PhucKhaoThanhCong = lazy(() => import("@/pages/phuc-khao/thong-bao-thanh-cong"));
const PhucKhaoPages = lazy(() => import("@/pages/phuc-khao/sinh-vien-phuc-khao"));
const QuyDinhPage = lazy(() => import("@/pages/sinh-vien/quy-dinh"));
const CoursePage = lazy(() => import("@/pages/sinh-vien/course"));
const ChuongThiSinhVienPage = lazy(() => import("@/pages/sinh-vien/chuong-thi"));
const DanhSachThiBuSVPages = lazy(() => import("@/pages/Thi-bu/thi-bu-sv"));

export const StudentRoute = [
  {
    path: "",
    element: <Navigate to="phong-hoc" />
  },
  {
    path: "phong-hoc",
    children: [
      {
        path: "",
        index: true,
        element: (
          <>
            <PageTitle title="Phòng học" />
            <LopHocPage />
          </>
        )
      },
      {
        path: ":id",
        element: (
          <>
            <PageTitle title="Phòng học chi tiết" />
            <LopHocDetailPage />
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
  {
    path: "bao-loi-sinh-vien",
    element: (
      <>
        <PageTitle title="Báo lỗi" />
        <DanhSachLoiCuaSinhVien />
      </>
    )
  },

  // {
  //   path: "phuc-khao/thanh-toan",
  //   element: <NopPhiPage />,
  //   loader: async () => {
  //     return configApi.getKiHocs();
  //   },
  // },
  {
    path: "qr-code/:id",
    element: <QrCode />,
    loader: async ({ params }: any) => {
      return Promise.all([
        phucKhaoSinhVienApi.cache().then((res) => res.data),
        phucKhaoSinhVienApi.getDetail(params.id).then((res) => res.data)
      ]);
    }
  },
  {
    path: "phuc-khao/:id",
    element: <PhucKhaoForm />,
    loader: async ({ params }: any) => {
      return bangDiemApi.item(params.id, { check_phuc_khao: true }).then((res) => res.data);
    }
  },
  {
    path: "phuc-khao",
    element: (
      <>
        <PageTitle title="Phúc khỏa" />
        <PhucKhaoPages />
      </>
    )
  },
  {
    path: "phuc-khao-thanh-cong",
    element: <PhucKhaoThanhCong />
  },
  {
    path: "lich-thi",
    element: (
      <>
        <PageTitle title="Lịch thi" />
        <LopThiPage />
      </>
    )
  },
  {
    path: "danh-sach-thi-bu-cua-sinh-vien",
    element: <DanhSachThiBuSVPages />
  },
  {
    path: "sinh-vien/quy-dinh",
    element: (
      <>
        <PageTitle title="Quy định" />
        <QuyDinhPage />
      </>
    )
  },
  {
    path: "phong-hoc/kiem-tra/:id",
    element: (
      <>
        <PageTitle title="Chủ đề" />
        <CoursePage />
      </>
    ),

    loader: async ({ params }: any) => {
      const res = await thiApi.taiLieu(params.id);
      return res.data;
    }
  },
  {
    path: "thi-lt",
    element: (
      <>
        <PageTitle title="Thi LT" />
        <ChuongThiSinhVienPage />
      </>
    )
  }
];
