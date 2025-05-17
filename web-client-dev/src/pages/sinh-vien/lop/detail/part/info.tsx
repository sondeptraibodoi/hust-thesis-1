import { GiaoVien } from "@/interface/giaoVien";
import { Lop } from "@/interface/lop";
import { Descriptions, DescriptionsProps } from "antd";
import { FC } from "react";

export const LopInfo: FC<{ data: Lop }> = ({ data }) => {
  const itemsInfor: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "2",
      label: "Loại",
      children: data?.loai
    },
    {
      key: "3",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "4",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "5",
      label: "Mã lớp kèm",
      children: data?.ma_kem
    },
    {
      key: "6",
      label: "Mã lớp",
      children: data?.ma
    },
    {
      key: "7",
      label: "Phòng",
      children: data?.phong
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Giảng viên",
      children:
        data &&
        data.giao_viens &&
        data?.giao_viens?.map((item: GiaoVien) => {
          if ((data.giao_viens as any).length > 1) {
            return item.name + ", ";
          }
          return item.name;
        })
    }
  ];

  const itemsInforThucTapEDoAn: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },

    {
      key: "4",
      label: "Mã lớp",
      children: data?.ma
    }
  ];

  const is_do_an =
    data.ma_hoc_phan != null && (data.ma_hoc_phan?.is_do_an === true || data.ma_hoc_phan?.is_do_an_tot_nghiep === true);

  const is_thuc_tap = data?.ma_hoc_phan !== null && data?.ma_hoc_phan?.is_thuc_tap === true;
  return (
    <>
      <Descriptions
        title={`Thông tin lớp học mã ${data?.ma}`}
        items={is_thuc_tap || is_do_an ? itemsInforThucTapEDoAn : itemsInfor}
        className="custom_descriptions mt-4"
      />
    </>
  );
};
