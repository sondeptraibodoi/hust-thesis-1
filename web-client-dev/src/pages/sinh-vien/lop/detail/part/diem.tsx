import { App, Descriptions, Tag } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

import { DescriptionsProps } from "antd/lib";
import { LoaiLopThi } from "@/constant";
import { LopDetail } from "..";
import LopSinhVienApi from "@/api/lop/lopCuaSinhVien.api";
import { useQueryClient } from "@tanstack/react-query";

export const LopDiem: FC<{ data: LopDetail }> = ({ data }) => {
  const is_do_an =
    data.ma_hoc_phan != null && (data.ma_hoc_phan?.is_do_an === true || data.ma_hoc_phan?.is_do_an_tot_nghiep === true);

  const is_thuc_tap = data?.ma_hoc_phan !== null && data?.ma_hoc_phan?.is_thuc_tap === true;
  if (is_thuc_tap) {
    return <DiemThucTap data={data} />;
  }
  if (is_do_an) {
    return <DiemBaoCao data={data} />;
  }
  return <DiemThi data={data} />;
};

const DiemThucTap: FC<{ data: LopDetail }> = () => {
  return <div></div>;
};
const DiemBaoCao: FC<{ data: LopDetail }> = ({ data }) => {
  const thong_tin_do_an =
    data && data.lop_sinh_vien_do_an && data.lop_sinh_vien_do_an[0] ? data.lop_sinh_vien_do_an[0] : {};

  const itemsBaoCao: DescriptionsProps["items"] = useMemo(
    () => [
      {
        key: "4",
        label: "Giáo viên hướng dẫn",
        children: thong_tin_do_an?.giao_vien?.name
      },
      {
        key: "1",
        label: "Tên đồ án",
        children: thong_tin_do_an.ten_de_tai
      },
      {
        key: "2",
        label: "Nôi dung",
        children: <div className="whitespace-pre-wrap">{thong_tin_do_an.noi_dung}</div>
      },
      {
        key: "3",
        label: "Các mốc kiểm soát chính",
        children: <div className="whitespace-pre-wrap">{thong_tin_do_an.cac_moc_quan_trong}</div>
      },
      {
        key: "5",
        label: "Giáo viên phản biện",
        children: <div className="whitespace-pre-wrap">{data?.giao_vien_phan_bien[0]?.giao_vien.name}</div>
      }
    ],
    []
  );
  return (
    <Descriptions title={`Đồ án`} items={itemsBaoCao} column={1} size={"default"} labelStyle={{ minWidth: 200 }} />
  );
};

const DiemThi: FC<{ data: LopDetail }> = ({ data }) => {
  const queryClient = useQueryClient();
  const { notification: api } = App.useApp();
  const div_khong_tinh_chuyen_can = useMemo(() => {
    if (!data || !data.extra || data.extra.length === 0) {
      return "";
    }
    if (data.extra.length === 1) {
      const lop_extra = data.extra[0].parent_lop;
      if (lop_extra.loai === "LT" || lop_extra.loai === "BT")
        return <Tag>Không được tính của lớp {lop_extra.loai}</Tag>;
    }
    return <Tag>Không được tính điểm chuyên cần</Tag>;
  }, [data]);
  const diem_y_thuc = useMemo(() => {
    if (!data) {
      return "";
    }
    if (!data.sinh_viens) {
      return "";
    }
    if (!data.sinh_viens[0]) {
      return "";
    }
    if (!data.sinh_viens[0].pivot) {
      return "";
    }
    if (data.sinh_viens[0].pivot.diem_y_thuc == null) {
      return "";
    }
    return data.sinh_viens[0].pivot.diem_y_thuc;
  }, [data]);
  const [diemThis, setDiemThis] = useState<{
    GK?: number;
    GK2?: number;
    DIEM_QT?: number;
    DIEM_CK?: number;
    DIEM_HP?: number;
    DIEM_CHUYEN_CAN?: number;
    DIEM_LT?: number;
    DIEM_LT_LOAI?: string;
  }>({});
  useEffect(() => {
    const getDiemThis = async () => {
      try {
        const res = await queryClient.fetchQuery({
          queryKey: ["lop", data.id, "diem"],
          queryFn: ({ queryKey }) => {
            const [_, lop_id] = queryKey;
            return LopSinhVienApi.getDiemThis(lop_id);
          },
          staleTime: Infinity
        });

        setDiemThis(res.data);
      } catch (error) {
        api.error({
          message: "Thất bại",
          description: "Hiện nay không thể lấy thông tin các điểm thi"
        });
      }
    };
    getDiemThis();
  }, []);

  let itemsDiem: DescriptionsProps["items"] = [];
  switch (data.loai_thi) {
    case LoaiLopThi.Thi_Theo_Chuong:
      itemsDiem = [
        {
          key: "1",
          label: "Điểm giữa kỳ",
          children: diemThis?.GK && diemThis?.GK < 0 ? "-" : diemThis?.GK
        },
        {
          key: "2",
          label: "Điểm LT",
          children: (
            <>
              <span>
                {diemThis?.DIEM_LT && diemThis?.DIEM_LT < 0 ? "-" : diemThis?.DIEM_LT}
                {diemThis.DIEM_LT_LOAI == "diem-lt-b-learning" && (
                  <span className="mx-1">
                    <Tag> Điểm Blearning</Tag>
                  </span>
                )}
              </span>
            </>
          )
        },
        {
          key: "3",
          label: "Điểm cuối kỳ",
          children: diemThis?.DIEM_CK && diemThis?.DIEM_CK < 0 ? "-" : diemThis?.DIEM_CK
        },
        {
          key: "4",
          label: "Điểm tích cực",
          children: diem_y_thuc
        },
        {
          key: "5",
          label: "Điểm chuyên cần học tập",
          children: (
            <span>
              {diemThis?.DIEM_CHUYEN_CAN}
              <span className="mx-1">{div_khong_tinh_chuyen_can}</span>
            </span>
          )
        },
        {
          key: "6",
          label: "Điểm quá trình",
          children: diemThis?.DIEM_QT
        },
        {
          key: "7",
          label: "Điểm học phần",
          children: diemThis?.DIEM_HP
        }
      ];
      break;
    case LoaiLopThi.Thi_1_GK:
    case LoaiLopThi.Thi_GK_30:
      itemsDiem = [
        {
          key: "1",
          label: "Điểm giữa kỳ",
          children: diemThis?.GK && diemThis?.GK < 0 ? "-" : diemThis?.GK
        },
        {
          key: "3",
          label: "Điểm cuối kỳ",
          children: diemThis?.DIEM_CK && diemThis?.DIEM_CK < 0 ? "-" : diemThis?.DIEM_CK
        },
        {
          key: "4",
          label: "Điểm tích cực",
          children: diem_y_thuc
        },
        {
          key: "5",
          label: "Điểm chuyên cần học tập",
          children: (
            <span>
              {diemThis?.DIEM_CHUYEN_CAN}
              <span className="mx-1">{div_khong_tinh_chuyen_can}</span>
            </span>
          )
        },
        {
          key: "6",
          label: "Điểm quá trình",
          children: diemThis?.DIEM_QT
        },
        {
          key: "7",
          label: "Điểm học phần",
          children: diemThis?.DIEM_HP
        }
      ];
      break;
    case LoaiLopThi.Thi_2_GK:
      itemsDiem = [
        {
          key: "1",
          label: "Điểm giữa kỳ",
          children: diemThis?.GK && diemThis?.GK < 0 ? "-" : diemThis?.GK
        },
        {
          key: "2",
          label: "Điểm giữa kỳ 2",
          children:
            data.loai_thi !== "thi_giua_ki_30" ? (diemThis?.GK2 && diemThis?.GK2 < 0 ? "-" : diemThis?.GK2) : null
        },
        {
          key: "3",
          label: "Điểm cuối kỳ",
          children: diemThis?.DIEM_CK && diemThis?.DIEM_CK < 0 ? "-" : diemThis?.DIEM_CK
        },
        {
          key: "4",
          label: "Điểm tích cực",
          children: diem_y_thuc
        },
        {
          key: "5",
          label: "Điểm chuyên cần học tập",
          children: (
            <span>
              {diemThis?.DIEM_CHUYEN_CAN}
              <span className="mx-1">{div_khong_tinh_chuyen_can}</span>
            </span>
          )
        },
        {
          key: "6",
          label: "Điểm quá trình",
          children: diemThis?.DIEM_QT
        },
        {
          key: "7",
          label: "Điểm học phần",
          children: diemThis?.DIEM_HP
        }
      ];
      break;

    default:
      break;
  }

  return <Descriptions title={`Điểm`} items={itemsDiem} />;
};
