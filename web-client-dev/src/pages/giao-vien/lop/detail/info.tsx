import { Lop } from "@/interface/lop";
import { Descriptions, DescriptionsProps, Form, Row } from "antd";
import { FC } from "react";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};
const LopHocDetailInfoPage: FC<{ lop: Lop }> = ({ lop }) => {
  const [form] = Form.useForm();
  const itemsInfor: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Kì học",
      children: lop?.ki_hoc
    },
    {
      key: "2",
      label: "Mã lớp học",
      children: lop?.ma
    },
    {
      key: "3",
      label: "Mã lớp kèm",
      children: lop?.ma_kem
    },
    {
      key: "4",
      label: "Mã học phần",
      children: lop?.ma_hp
    },
    {
      key: "5",
      label: "Tên học phần",
      children: lop?.ten_hp
    },
    {
      key: "6",
      label: "Loại",
      children: lop?.loai
    },
    {
      key: "7",
      label: "Phòng",
      children: lop?.phong
    },
    {
      key: "8",
      label: "Ghi chú",
      children: lop?.ghi_chu
    },
    {
      key: "9",
      label: "Ngày mở điểm danh",
      children: lop?.ngay_mo_diem_danh
    },
    {
      key: "10",
      label: "Ngày đóng điểm danh",
      children: lop?.ngay_dong_diem_danh
    }
  ];
  return (
    <div className="diemdanh__respon">
      <Form form={form} {...layout} disabled labelWrap initialValues={lop}>
        <Row>
          <Descriptions title="Thông tin" items={itemsInfor} className="custom_descriptions mt-4" />
        </Row>
      </Form>
    </div>
  );
};

export default LopHocDetailInfoPage;
