import { Navigate, RouteObject } from "react-router-dom";

import baiThiApi from "@/api/baiThi/baiThi.api";
import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import diemLopThiApi from "@/api/bangDiem/diemLopThi.api";
import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import lanDiemDanhApi from "@/api/lop/lanDiemDanh.api";
import lopDoAnApi from "@/api/lop/lopDoAn.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import lopThiApi from "@/api/lop/lopThi.api";
import maHocPhanApi from "@/api/maHocPhan/maHocPhan.api";
import nhiemVuCuaToiApi from "@/api/nhiemVu/nhiemVuCuaToi.api";
import { lazy } from "react";

const DanhSachCauHoiTroLyPage = lazy(() => import("@/pages/tro-ly/cau-hoi"));
const DanhSachLopDiemPage = lazy(() => import("@/pages/tro-ly/lop-diem"));
const CauHoiDetailTroLyPage = lazy(() => import("@/pages/tro-ly-hoc-phan/cau-hoi/detail"));
const DanhSachBaiThiSinhVienPage = lazy(() => import("@/pages/tro-ly/bai-thi-sinh-vien"));
const BaiThiSinhVienDetailPage = lazy(() => import("@/pages/tro-ly/bai-thi-sinh-vien/detail-bai-thi-sinh-vien"));
const ThongKeDuLieuPage = lazy(() => import("@/pages/thong-ke/dashboard-thong-ke-du-lieu"));
const HocPhanChuongDetailPage = lazy(() => import("@/pages/tro-ly-hoc-phan/hoc-phan-chuong/detail"));

const NhiemVuPage = lazy(() => import("@/pages/nhiem-vu/nhiem-vu"));
const NhiemVuChiTietPage = lazy(() => import("@/pages/nhiem-vu/nhiem-vu-chi-tiet"));

//lop hoc
const LopHocDiemDanhPage = lazy(() => import("@/pages/giao-vien/lop/diem-danh"));

const SettingPage = lazy(() => import("@/pages/setting"));



//
const SapXepLichTrongThiPage = lazy(() => import("@/pages/SapXepLichTrongThi/index"));

const LopCoiThiGiaoViendDetail = lazy(() => import("@/pages/SapXepLichTrongThi/xem-giao-vien-da-sap-xep"));

const LopCoiThiGiaoVien = lazy(() => import("@/pages/SapXepLichTrongThi/lop-coi-thi-giao-vien"));
// Bao loi
const BaoLoiPage = lazy(() => import("@/pages/giao-vien/bao-loi"));
// Lop thi
const LopThiPage = lazy(() => import("@/pages/lop-thi/index"));
const ThongKeDiemDanhPage = lazy(() => import("@/pages/thong-ke/thong-ke-diem-danh"));
const ThongKeDiemPage = lazy(() => import("@/pages/thong-ke/thong-ke-diem"));

//Danh sách trượt môn
const DanhSachTruotMonPage = lazy(() => import("@/pages/thong-ke/thong-ke-truot-mon"));

const DoAnPage = lazy(() => import("@/pages/do-an"));
const PhanBienPage = lazy(() => import("@/pages/phan-bien"));

//mã học phần
const MaHocPhanPage = lazy(() => import("@/pages/ma-hoc-phan"));
const TaiLieuHocPhanPage = lazy(() => import("@/pages/tai-lieu/tai-lieu-hoc-phan/tai-lieu"));
const DetailMaHocPhan = lazy(() => import("@/pages/ma-hoc-phan/detail"));
//Tài liệu chung
const TaiLieuChungPage = lazy(() => import("@/pages/tai-lieu/tai-lieu-chung"));
//Loai tài liệu
const LoaiTaiLieuPage = lazy(() => import("@/pages/tai-lieu/loai-tai-lieu"));
export const AssistantRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="lop-hoc" />
  },
  {
    path: "lop-hoc",
    children: [
      {
        path: ":id",
        children: [
          // {
          //   path: "",
          //   loader: async ({ params }: any) => {
          //     return lopHocApi
          //       .getDetail(params.id, {
          //         with: "giaoViens,children,sinhViens"
          //       })
          //       .then((res) => res.data);
          //   },
          //   element: <DetailClass />
          // },
          {
            path: "diem-danh/:diem_danh_id",
            element: <LopHocDiemDanhPage />,
            loader: async ({ params }: any) => {
              return lanDiemDanhApi.getDetail(params.diem_danh_id, {
                with: "lop,lop.children"
              }) as any;
            }
          },
          // {
          //   path: "sinh-vien/:bang_diem_id",
          //   element: <ListSinhVienSoatDiemLopThiPage />,
          //   loader: async ({ params }: any) => {
          //     return lopThiApi.getDetail(params.bang_diem_id, {
          //       with: "sinhViens,lopThiSinhVien,lop"
          //     });
          //   }
          // },
          // {
          //   path: "danh-sach/:bang_diem_id",
          //   element: <ListSinhVienLopThiPage />,
          //   loader: async ({ params }: any) => {
          //     return lopThiApi.getDetail(params.bang_diem_id, {
          //       with: "sinhViens,lopThiSinhVien,lop"
          //     });
          //   }
          // },
          // {
          //   path: ":sinh_vien_id/danh-gia",
          //   loader: async ({ params }: any) => {
          //     return lopDoAnApi.show(params.id, params.sinh_vien_id).then((res) => res.data);
          //   },
          //   element: <DanhGiaSinhVien />
          // }
        ]
      }
    ]
  },
  {
    path: "tro-ly",
    children: [
      // { path: "danh-sach-thuc-tap", element: <ThucTapPage /> },
      { path: "danh-sach-diem", element: <DanhSachLopDiemPage /> },
      { path: "danh-sach-do-an", element: <DoAnPage /> },
      {
        path: "danh-sach-phan-bien",
        children: [
          { path: "", element: <PhanBienPage /> },
          // {
          //   path: ":id/:sinh_vien_id/danh-gia",
          //   loader: async ({ params }: any) => {
          //     return lopDoAnApi.show(params.id, params.sinh_vien_id).then((res) => res.data);
          //   },
          //   element: <DanhGiaSinhVien title="Danh sách sinh viên phản biện" readonly />
          // }
        ]
      }
    ]
  },
  { path: "cai-dat", element: <SettingPage /> },
  // { path: "tai-tap-tin", element: <ImportPage /> },
  {
    path: "bang-diem-tro-ly",
    children: [
      // { path: "", element: <DanhSachBangDiem /> },
      {
        path: ":id",
        children: [
          // {
          //   path: "",
          //   element: <NhanDienDiemPage />
          // },
          {
            path: "danh-sach-lop-thi",
            children: [
              // { path: "", element: <DanhSachLopThi /> },
              // {
              //   path: "bang-diem/:lop_thi_id",
              //   element: <BangDiemMon />,
              //   loader: async ({ params }: any) => {
              //     return Promise.all([
              //       diemLopThiApi.list({ id: params.lop_thi_id }).then((res) => res.data),
              //       bangDiemApi.show(params.id).then((res) => res.data)
              //     ]);
              //   }
              // }
            ]
          }
        ]
      }
    ]
  },
  // { path: "danh-sach-phuc-khao", element: <DanhSachPhucKhao /> },
  // { path: "tin-nhan-thanh-toan", element: <TinNhanhThanhToan /> },
  { path: "bao-loi", element: <BaoLoiPage /> },
  {
    path: "sap-xep-lich-trong-thi",
    children: [
      { path: "", element: <SapXepLichTrongThiPage /> },
      {
        path: "giao-vien/:id",
        element: <LopCoiThiGiaoVien />
      },
      {
        path: "lop-coi-thi-giao-vien-chi-tiet",
        element: <LopCoiThiGiaoViendDetail />
      }
    ]
  },
  { path: "thong-ke-diem-danh", element: <ThongKeDiemDanhPage /> },
  { path: "thong-ke-diem", element: <ThongKeDiemPage /> },

  { path: "lop-thi", element: <LopThiPage /> },

  // {
  //   path: "diem-phuc-khao",
  //   element: <DiemPhucKhaoPage />
  // },
  {
    path: "giao-nhiem-vu",
    children: [
      { path: "", index: true, element: <NhiemVuPage /> },
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
  { path: "danh-sach-truot-mon", element: <DanhSachTruotMonPage /> },
  {
    path: "tro-ly-hoc-phan-chuong/:ma_hoc_phan",
    loader: async ({ params }: any) => {
      return hocPhanChuongApi.info(params.ma_hoc_phan).then((res) => res.data);
    },
    element: <HocPhanChuongDetailPage />
  },
  { path: "tai-lieu-chung", element: <TaiLieuChungPage /> },
  { path: "loai-tai-lieu", element: <LoaiTaiLieuPage /> },
  { path: "tai-lieu-hoc-phan", element: <TaiLieuHocPhanPage /> },
  { path: "thong-ke-du-lieu", element: <ThongKeDuLieuPage /> },
  {
    path: "ma-hoc-phan",
    children: [
      {
        path: "",
        element: <MaHocPhanPage />
      },
      {
        path: ":id",
        loader: async ({ params }: any) => {
          const maHocPhanDetail = await maHocPhanApi.getDetail(params.id);
          const maHocPhanData = maHocPhanDetail.data;

          return maHocPhanData;
        },
        element: <DetailMaHocPhan />
      }
    ]
  },
  {
    path: "tro-ly/cau-hoi",
    children: [
      {
        path: "",
        element: <DanhSachCauHoiTroLyPage />
      },
      {
        path: ":id",
        element: <CauHoiDetailTroLyPage />
      }
    ]
  },
  {
    path: "tro-ly/danh-sach-bai-thi",
    children: [
      {
        path: "",
        element: <DanhSachBaiThiSinhVienPage />
      },
      {
        path: ":id",
        element: <BaiThiSinhVienDetailPage isTroLy />,
        loader: async ({ params }: any) => {
          return baiThiApi.baiThiDetail(params.id).then((res) => res.data);
        }
      }
    ]
  }
];
