import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import diemLopThiApi from "@/api/bangDiem/diemLopThi.api";
import lanDiemDanhApi from "@/api/lop/lanDiemDanh.api";
import lopCuaGiaoVienApi from "@/api/lop/lopCuaGiaoVien.api";
import lopThiApi from "@/api/lop/lopThi.api";
import nhiemVuCuaToiApi from "@/api/nhiemVu/nhiemVuCuaToi.api";
import LopThucTapDoAnPage from "@/pages/giao-vien/lop-do-an/lop-do-an";
import DoAnTotNghiepPage from "@/pages/giao-vien/lop-do-an/lop-do-an-tot-nghiep";
import ThucTapPage from "@/pages/giao-vien/lop-do-an/thuc-tap-page";

import lopDoAnApi from "@/api/lop/lopDoAn.api";
import thiApi from "@/api/sinhVien/thi.api";
import CauHoiGvPage from "@/pages/giao-vien/cau-hoi";
import SinhVienPhanBienPage from "@/pages/giao-vien/phan-bien";
import DanhGiaSinhVien from "@/pages/lop/detail/danh-gia-sinh-vien";
import CoursePage from "@/pages/sinh-vien/course";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

//lop hoc
const LopHocPage = lazy(() => import("@/pages/giao-vien/lop"));
const LopHocDetailPage = lazy(() => import("@/pages/giao-vien/lop/detail"));

const LopHocDiemDanhPage = lazy(() => import("@/pages/giao-vien/lop/diem-danh"));

//bảng diêm
const DanhSachBangDiem = lazy(() => import("@/pages/bang-diem/danh-sach-bang-diem"));
const ShowPDFPage = lazy(() => import("@/pages/bang-diem/showPDFPage"));
const DanhSachLopThi = lazy(() => import("@/pages/bang-diem/lop-thi-mon/index"));
const BangDiemMon = lazy(() => import("@/pages/bang-diem/lop-thi-mon/bang-diem-mon"));
const ListSinhVienSoatDiemLopThiPage = lazy(() => import("@/pages/lop/detail/list-lop-thi-soat-diem"));

//lớp trông thi
const LopTrongThiPage = lazy(() => import("@/pages/giao-vien/lop-trong-thi"));
const NhiemVuCuaToiPage = lazy(() => import("@/pages/nhiem-vu/nhiem-vu-cua-toi"));
const NhiemVuChiTietPage = lazy(() => import("@/pages/nhiem-vu/nhiem-vu-chi-tiet"));

const QuyDinhPage = lazy(() => import("@/pages/sinh-vien/quy-dinh"));

const DanhGiaDoAnSinhVien = lazy(() => import("@/pages/giao-vien/lop-do-an/danh-gia-sinh-vien"));

const TaiLieuPage = lazy(() => import("@/pages/giao-vien/tai-lieu"));

const CauHoiDetailInfoPage = lazy(() => import("@/pages/giao-vien/cau-hoi/detail-cau-hoi"));
const CauHoiPhanBienGvPage = lazy(() => import("@/pages/giao-vien/cau-hoi/phan-bien"));
const CauHoiPhanBienDetailGvPage = lazy(() => import("@/pages/giao-vien/cau-hoi/phan-bien/detail"));

export const TeacherRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="lop-day" />
  },
  {
    path: "lop-day",
    children: [
      {
        path: "",
        element: <LopHocPage />
      },
      {
        path: ":id",
        children: [
          {
            path: "",
            element: <LopHocDetailPage />,
            loader: async ({ params }: any) => {
              return lopCuaGiaoVienApi.getDetail(params.id, {
                with: "giaoViens,children"
              });
            }
          },
          {
            path: "diem-danh/:diem_danh_id",
            element: <LopHocDiemDanhPage />,
            loader: async ({ params }: any) => {
              return lanDiemDanhApi.getDetail(params.diem_danh_id, {
                with: "lop,lop.children"
              });
            }
          },
          {
            path: "bang-diem/:bang_diem_id",
            element: <ListSinhVienSoatDiemLopThiPage />,
            loader: async ({ params }: any) => {
              return lopThiApi.getDetail(params.bang_diem_id, {
                with: "sinhViens,lopThiSinhVien,lop"
              });
            }
          }
        ]
      },
      {
        path: "kiem-tra/:id",
        element: <CoursePage />,
        loader: async ({ params }: any) => {
          const res = await thiApi.taiLieu(params.id);
          return res.data;
        }
      }
    ]
  },
  {
    path: "danh-sach-bang-diem",
    children: [
      { path: "", element: <DanhSachBangDiem /> },
      {
        path: ":id",
        children: [
          {
            path: "",
            element: <ShowPDFPage />
          },
          {
            path: "danh-sach-lop-thi",
            children: [
              { path: "", element: <DanhSachLopThi /> },
              {
                path: "bang-diem/:lop_thi_id",
                element: <BangDiemMon />,
                loader: async ({ params }: any) => {
                  return Promise.all([
                    diemLopThiApi.list({ id: params.lop_thi_id }).then((res) => res.data),
                    bangDiemApi.show(params.id).then((res) => res.data)
                  ]);
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: "lop-trong-thi",
    element: <LopTrongThiPage />
  },

  {
    path: "quy-dinh",
    element: <QuyDinhPage />
  },
  {
    path: "giao-vien",
    children: [
      {
        path: "tai-lieu",
        element: <TaiLieuPage />
      },
      {
        path: "nhiem-vu-cua-toi",

        children: [
          {
            path: "",
            index: true,
            element: <NhiemVuCuaToiPage />
          },
          {
            path: ":id",
            index: true,
            element: <NhiemVuChiTietPage />,
            loader: async ({ params }: any) => {
              return nhiemVuCuaToiApi.show(params.id).then((res) => res.data);
            }
          }
        ]
      },
      {
        path: "cau-hoi",
        children: [
          {
            path: "",
            index: true,
            element: <CauHoiGvPage />
          },
          {
            path: ":id",
            element: <CauHoiDetailInfoPage />
          }
        ]
      },
      {
        path: "cau-hoi/phan-bien",
        children: [
          {
            path: "",
            index: true,
            element: <CauHoiPhanBienGvPage />
          },
          {
            path: ":id",
            element: <CauHoiPhanBienDetailGvPage />
          }
        ]
      },
      {
        path: "do-an",
        children: [
          {
            path: "",
            element: <LopThucTapDoAnPage />
          },
          {
            path: ":lop_id/:sinh_vien_id/danh-gia",
            loader: async ({ params }: any) => {
              return lopDoAnApi.show(params.lop_id, params.sinh_vien_id).then((res) => res.data);
            },
            element: <DanhGiaDoAnSinhVien />
          }
        ]
      },
      {
        path: "do-an-tot-nghiep",
        children: [
          {
            path: "",
            element: <DoAnTotNghiepPage />
          },
          {
            path: ":lop_id/:sinh_vien_id/danh-gia",
            loader: async ({ params }: any) => {
              return lopDoAnApi.show(params.lop_id, params.sinh_vien_id).then((res) => res.data);
            },
            element: <DanhGiaDoAnSinhVien title={"Quản lý đồ án tốt nghiệp"} />
          }
        ]
      },
      {
        path: "do-an/phan-bien",
        children: [
          {
            path: "",
            element: <SinhVienPhanBienPage />
          },
          {
            path: ":id/:sinh_vien_id/danh-gia",
            loader: async ({ params }: any) => {
              return lopDoAnApi.show(params.id, params.sinh_vien_id).then((res) => res.data);
            },
            element: <DanhGiaSinhVien title="Danh sách sinh viên phản biện" readonly />
          }
        ]
      },
      {
        path: "thuc-tap",
        element: <ThucTapPage />
      }
    ]
  }
];
