import { GiaoVien } from "@/interface/giaoVien";
import { Lop } from "@/interface/lop";
import { Descriptions, DescriptionsProps, Form, Row } from "antd";
import { FC, useEffect } from "react";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};
const LopHocDetailInfoPage: FC<{ lop: Lop }> = ({ lop }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (lop) {
      form.setFieldsValue({
        ...lop,
        giao_viens: lop.giao_viens?.map((item: GiaoVien) => item.id)
      });
    }
  }, [lop, form]);
  const itemsInfor: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Kì học",
      children: lop?.ki_hoc
    },
    {
      key: "2",
      label: "Mã lớp kèm",
      children: lop?.ma_kem
    },
    {
      key: "3",
      label: "Mã học phần",
      children: lop?.ma_hp
    },
    {
      key: "4",
      label: "Tên học phần",
      children: lop?.ten_hp
    },
    {
      key: "5",
      label: "Loại",
      children: lop?.loai
    },
    {
      key: "6",
      label: "Phòng",
      children: lop?.phong
    },
    {
      key: "7",
      label: "Giảng viên",
      children:
        lop &&
        lop.giao_viens &&
        lop?.giao_viens?.map((item: GiaoVien) => {
          if ((lop.giao_viens as any).length > 1) {
            return item.name + ", ";
          }
          return item.name;
        })
    },
    {
      key: "8",
      label: "Tuần học",
      children: lop?.tuan_hoc
    }
  ];
  return (
    <Form form={form} disabled={true} layout="vertical" {...layout} labelWrap>
      <Row>
        <Descriptions title="Thông tin" items={itemsInfor} className="custom_descriptions mt-4" />
      </Row>
    </Form>
  );
};

export default LopHocDetailInfoPage;
