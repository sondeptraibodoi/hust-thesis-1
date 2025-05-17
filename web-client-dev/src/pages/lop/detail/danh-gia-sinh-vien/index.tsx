import PageContainer from "@/Layout/PageContainer";
import { LopSinhVienDoAn } from "@/interface/lop";
import { Descriptions } from "antd";
import { DescriptionsProps } from "antd/lib";
import { FC, useMemo } from "react";
import { useLoaderData } from "react-router-dom";
import DanhGiaSinhVienList from "./danh-gia-list";

const DanhGiaSinhVien: FC<{ title?: string; readonly?: boolean }> = ({
  title = "Danh sách sinh viên đồ án",
  readonly
}) => {
  const sinhVienDoAn = useLoaderData() as LopSinhVienDoAn;
  const breadcrumbs = useMemo(() => {
    return [
      { router: "../", text: title },
      { text: sinhVienDoAn.lop?.ten_hp },
      { text: sinhVienDoAn.lop?.ma },
      { text: sinhVienDoAn.sinh_vien?.name }
    ];
  }, [sinhVienDoAn]);
  const itemsBaoCao: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Tên đồ án",
      children: sinhVienDoAn.ten_de_tai
    },
    {
      key: "4",
      label: "Giáo viên hướng dẫn",
      children: sinhVienDoAn?.giao_vien?.name
    },
    {
      key: "2",
      label: "Nôi dung",
      children: <div className="whitespace-pre-wrap">{sinhVienDoAn.noi_dung}</div>
    },
    {
      key: "3",
      label: "Các mốc kiểm soát chính",
      children: <div className="whitespace-pre-wrap">{sinhVienDoAn.cac_moc_quan_trong}</div>
    }
  ];
  const itemsSinhVien: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Tên Sinh viên",
      children: sinhVienDoAn.sinh_vien?.name
    },
    {
      key: "2",
      label: "MSSV",
      children: sinhVienDoAn.sinh_vien?.mssv
    },
    {
      key: "3",
      label: "Lớp",
      children: sinhVienDoAn.sinh_vien?.group
    }
  ];
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <div className="custom_descriptions mt-4">
        <Descriptions title={`Thông tin sinh viên`} items={itemsSinhVien} />
        <Descriptions title={`Đồ án`} items={itemsBaoCao} column={1} size={"default"} labelStyle={{ minWidth: 200 }} />
      </div>
      <div>
        <DanhGiaSinhVienList lopId={sinhVienDoAn.lop_id} sinhVienId={sinhVienDoAn.sinh_vien_id} readonly={readonly} />
      </div>
    </PageContainer>
  );
};
export default DanhGiaSinhVien;
