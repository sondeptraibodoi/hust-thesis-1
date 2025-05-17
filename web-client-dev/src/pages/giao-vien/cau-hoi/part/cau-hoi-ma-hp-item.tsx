import { Checkbox, Form, Select } from "antd";

import { FC } from "react";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import maHocPhanApi from "@/api/maHocPhan/maHocPhan.api";
import { useQuery } from "@tanstack/react-query";

interface QuestionFormFieldsProps {
  field: any;
  name: string;
  isEditingDisabled: boolean;
}

const listDoKho = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" }
];
const MaHpFormFields: FC<QuestionFormFieldsProps> = ({ field, name, isEditingDisabled }) => {
  const form = Form.useFormInstance();
  const ma_hp = Form.useWatch([name, field.name, "ma_hoc_phan"], form);

  const { data: dataHocPhan, isLoading: loadingHocPhan } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["ma-hoc-phan"],
    queryFn: () => {
      return maHocPhanApi.list().then((res) => res.data);
    }
  });
  const { data: dataChuong, isLoading: loadingChuong } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["ma-hoc-phan", ma_hp],
    enabled: !!ma_hp,
    queryFn: ({ queryKey }) => {
      const [_, ma_hp] = queryKey;
      return cauHoiApi.listChuong(ma_hp).then((res) => res.data);
    }
  });

  return (
    <>
      <Form.Item
        {...field}
        key="ma_hoc_phan"
        label="Mã học phần"
        name={[field.name, "ma_hoc_phan"]}
        rules={[{ required: true, message: "Mã học phần không được bỏ trống" }]}
      >
        <Select
          showSearch
          loading={loadingHocPhan}
          onChange={() => {
            form.setFieldsValue({ chuong_id: undefined });
          }}
          options={(dataHocPhan || []).map((item: any) => ({
            value: item.ma,
            label: (
              <>
                {item.ma} - {item.ten_hp}
              </>
            )
          }))}
          disabled={isEditingDisabled}
        ></Select>
      </Form.Item>

      <Form.Item
        {...field}
        label="Chủ đề"
        key="chuong_id"
        name={[field.name, "chuong_id"]}
        rules={[{ required: true, message: "Chủ đề không được bỏ trống" }]}
      >
        <Select
          showSearch
          loading={loadingChuong}
          options={(dataChuong || []).map((item: any) => ({
            value: item.id,
            label: `CĐ ${item.stt} - ${item.ten}`
          }))}
        ></Select>
      </Form.Item>

      <Form.Item
        {...field}
        label="Độ khó"
        key="do_kho"
        name={[field.name, "do_kho"]}
        rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}
      >
        <Select options={listDoKho}></Select>
      </Form.Item>

      <Form.Item {...field} key="is_primary" name={[field.name, "is_primary"]} valuePropName="checked" noStyle>
        <Checkbox
          defaultChecked={false}
          onChange={(e) => {
            const value = form.getFieldValue("chuongs");
            if (e.target.checked) {
              value.forEach((element: any, i: number) => {
                element.is_primary = i == field.name;
              });
            } else {
              value[0].is_primary = true;
            }
            form.setFieldValue("chuongs", value);
          }}
          disabled={isEditingDisabled}
        >
          Hiển thị chính
        </Checkbox>
      </Form.Item>
    </>
  );
};

export default MaHpFormFields;
