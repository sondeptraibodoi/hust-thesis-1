import { DateFormat } from "@/components/format/date";
import {
  ChuongCellRender,
  DoKhoCellRender,
  LoaiCauHoiCellRender,
  LoaiThiCellRender,
  TrangThaiCauHoiCellRender,
  TrangThaiPhanBienCellRender
} from "@/components/TrangThaiCellRender";
import { STATUS_QUESTION } from "@/constant";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { Descriptions, Tag } from "antd";
import { DescriptionsProps } from "antd/lib";
import { FC, memo } from "react";
import { useTranslation } from "react-i18next";

export const CauHoiInfo: FC<{ data: HocPhanCauHoi; isTroLy?: boolean }> = memo(({ data, isTroLy }) => {
  const { t } = useTranslation("chi-tiet-cau-hoi");
  let itemsInfor: DescriptionsProps["items"] = [
    {
      key: "1",
      label: <p className="text-black">{t("field.ma_hoc_phan")}</p>,
      children: data.primary_chuong?.ma_hoc_phan
    },
    {
      key: "2",
      label: <p className="text-black">{t("field.ten_hp")}</p>,
      children: data.primary_chuong?.ma_hp?.ten_hp
    },
    {
      key: "3",
      label: <p className="text-black">{t("field.ten_chu_de")}</p>,
      children: <ChuongCellRender ten={data.primary_chuong?.chuong?.ten} stt={data.primary_chuong?.chuong?.stt} />
    },
    {
      key: "4",
      label: <p className="text-black">{t("field.do_kho")}</p>,
      children: DoKhoCellRender({ data: data.primary_chuong?.do_kho })
    },
    {
      key: "5",
      label: <p className="text-black">{t("field.trang_thai_cau_hoi")}</p>,
      children: TrangThaiCauHoiCellRender({ data: data.trang_thai })
    },

    {
      key: "6",
      label: <p className="text-black">{t("field.loai")}</p>,
      children: LoaiCauHoiCellRender({ data })
    },
    {
      key: "7",
      label: <p className="text-black">{t("field.loai_thi")}</p>,
      children: LoaiThiCellRender({ data: data.primary_chuong?.loai_thi?.loai })
    }
  ];
  if (data.is_machine) {
    itemsInfor.push({
      key: "8",
      label: <p className="text-black">{t("field.is_machine")}</p>,
      children: <Tag color="purple">Từ máy</Tag>
    });
  }
  if (
    isTroLy &&
    [
      STATUS_QUESTION.CHO_DUYET1,
      STATUS_QUESTION.CHO_DUYET2,
      STATUS_QUESTION.CHO_PHAN_BIEN,
      STATUS_QUESTION.CHO_PHAN_BIEN,
      STATUS_QUESTION.CHO_PHAN_BIEN2
    ].includes(data.trang_thai)
  ) {
    itemsInfor = itemsInfor.concat([
      {
        key: "8",
        label: <p className="text-black">{t("field.giao_vien_phan_bien")}</p>,
        children: data.phan_bien?.giao_vien?.name
      },
      {
        key: "9",
        label: <p className="text-black">{t("field.trang_thai_phan_bien")}</p>,
        children: TrangThaiPhanBienCellRender({ data: data.phan_bien?.trang_thai_cau_hoi })
      },
      {
        key: "10",
        label: <p className="text-black">{t("field.han_phan_bien")}</p>,
        children: <DateFormat value={data.phan_bien?.ngay_han_phan_bien} />
      }
    ]);
  }
  return <Descriptions items={itemsInfor} className="custom_descriptions mt-4" />;
});
