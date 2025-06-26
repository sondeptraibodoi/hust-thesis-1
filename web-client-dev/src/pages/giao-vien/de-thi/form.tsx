import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import deThiApi from "@/api/deThi/deThi.api";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined } from "@ant-design/icons";
import { App, Button, Card, Form, Input } from "antd";
import { Select } from "antd/lib";
import { log } from "console";
import { ca, de } from "date-fns/locale";
import { debounce, get } from "lodash";
import React, { FC, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Props {
  type?: "create" | "update";
}

const level = [
  {
    value: 1,
    label: "Mức độ 1"
  },
  {
    value: 2,
    label: "Mức độ 2"
  },
  {
    value: 3,
    label: "Mức độ 3"
  },
  {
    value: 4,
    label: "Mức độ 4"
  },
  {
    value: 5,
    label: "Mức độ 5"
  },
  {
    value: 6,
    label: "Mức độ 6"
  },
  {
    value: 7,
    label: "Mức độ 7"
  },
  {
    value: 8,
    label: "Mức độ 8"
  },
  {
    value: 9,
    label: "Mức độ 9"
  },
  {
    value: 10,
    label: "Mức độ 10"
  }
];

const DeThiForm: FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const [cauHoi, setCauHoi] = React.useState<any[]>([]);
  const [cauHoiSelected, setCauHoiSelected] = React.useState<any[]>([]);
  const { id, dethi } = useParams<{ id: string; dethi?: string }>();
  const [form] = Form.useForm();
  const { notification: api } = App.useApp();
  useEffect(() => {
    if (!id) return;
    getCauHoi();
  }, [id, dethi, type]);

  useEffect(() => {
    if (type === "update" && dethi) {
      getDeThi();
    }
  }, [id, dethi, type, cauHoi]);


  const getCauHoi = async () => {
    if (!id) return;
    const res = await cauHoiApi.get({
      mon_hoc_id: Number(id)
    });
    if (!res.data) return;
    const data = res.data.map((x: any) => {
      return {
        id: x.id,
        de_bai: get(JSON.parse(x.de_bai), "de_bai", ""),
        a: get(JSON.parse(x.de_bai), "a", ""),
        b: get(JSON.parse(x.de_bai), "b", ""),
        c: get(JSON.parse(x.de_bai), "c", ""),
        d: get(JSON.parse(x.de_bai), "d", ""),
        dap_an: x.dap_an,
        do_kho: x.do_kho
      };
    });
    setCauHoi(data);
  };

  const getDeThi = async () => {
    if (!dethi) return;
    const res = await deThiApi.show({ id: Number(dethi) });
    if (!res.data) return;
    const data = res.data.data;
    setCauHoiSelected(cauHoi.filter((cauHoi: any) =>
    data.chi_tiet_de_this.some((chiTiet: any) => chiTiet.cau_hoi_id === cauHoi.id)
  ));
    form.setFieldsValue({
      thoi_gian: data.thoi_gian_thi,
      diem_dat: data.diem_dat,
      diem_toi_da: data.diem_toi_da,
      ghi_chu: data.ghi_chu
    });
  };

  const onDeleteItem = useCallback((id: number) => {
    setCauHoiSelected((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onFinish = useCallback(
    async (values: any) => {
      if (cauHoiSelected.length === 0) {
        api.error({
          message: "Lỗi",
          description: "Vui lòng chọn ít nhất một câu hỏi."
        });
        return;
      }
      try {
        const payload = {
          ...values,
          mon_hoc_id: Number(id),
          cau_hoi: cauHoiSelected.map((item) => {
            return {
              id: item.id,
              ghi_chu: item.ghi_chu ?? null
            };
          })
        };
        if (type === "create") {
          await deThiApi.post(payload);
        } else {
          await deThiApi.put({ id: Number(dethi), ...payload });
        }
        api.success({
          message: "Thành công",
          description: type === "create" ? "Tạo mới đề thi thành công!" : "Cập nhật đề thi thành công!"
        });
        const delay = debounce(() => {
          navigate(`/sohoa/mon-hoc/${id}/de-thi`);
        }, 200);
        delay();
      } catch (error) {
        api.error({
          message: "Lỗi",
          description: "Đã có lỗi xảy ra, vui lòng thử lại sau."
        });
      }
    },
    [cauHoiSelected, id]
  );
  return (
    <PageContainer title={type === "create" ? "Tạo mới" : "Chỉnh sửa"}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Card className="bg-white shadow-md rounded-lg p-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="thoi_gian"
              label="Thời gian làm bài (phút)"
              rules={[{ required: true, message: "Vui lòng nhập thời gian làm bài" }]}
            >
              <Input type="number" placeholder="Nhập thời gian làm bài (phút)" />
            </Form.Item>
            <Form.Item
              name="diem_dat"
              label="Điểm đạt"
              rules={[{ required: true, message: "Vui lòng nhập số điểm đạt" }]}
            >
              <Input type="number" placeholder="Nhập điểm đạt" />
            </Form.Item>
            <Form.Item name="diem_toi_da" label="Độ khó" rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}>
              <Select className="w-full" placeholder="Chọn độ khó">
                {level.map((lvl) => (
                  <Select.Option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="ghi_chu" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>
        </Card>
        <Card className="bg-white shadow-md rounded-lg p-2 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chọn câu hỏi</h2>
            <div className="flex items-center gap-2 w-full">
              <Select
                allowClear
                mode="multiple"
                className="w-full"
                placeholder="Chọn câu hỏi"
                value={cauHoiSelected.map((item) => item.id)}
                onChange={(value) => {
                  const selectedQuestions = cauHoi.filter((item) => value.includes(item.id));
                  setCauHoiSelected(selectedQuestions);
                }}
              >
                {cauHoi.map((item, index) => (
                  <Select.Option key={item.id} value={item.id}>
                    Câu {index + 1}: {item.de_bai}
                  </Select.Option>
                ))}
              </Select>
              {/* <Button
            type="primary"
            onClick={() => {
              // Logic to open modal for selecting questions
            }}
          >
            Chọn câu hỏi
          </Button> */}
            </div>
          </div>
          <p className="text-sm p-2">Danh sách câu hỏi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {cauHoiSelected.map((item, index) => (
              <div className="flex items-center justify-between" key={item.id}>
                <Card key={item.id} className="bg-gray-100 rounded-lg shadow-sm w-full">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg mb-2">
                        Câu {index + 1} :{item.de_bai}
                      </h3>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        type="primary"
                        onClick={() => onDeleteItem(item.id)} // nếu có
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                      <div>
                        <span className="font-bold">A. </span>
                        {item.a}
                      </div>
                      <div>
                        <span className="font-bold">B. </span>
                        {item.b}
                      </div>
                      <div>
                        <span className="font-bold">C. </span>
                        {item.c}
                      </div>
                      <div>
                        <span className="font-bold">D. </span>
                        {item.d}
                      </div>
                    </div>

                    <p>Đáp án đúng: {item.dap_an}</p>
                    <p>Độ khó: {item.do_kho}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex justify-end mt-4">
          <Button type="primary" htmlType="submit" className="mr-2">
            {type === "create" ? "Tạo mới" : "Cập nhật"}
          </Button>
          <Button onClick={() => window.history.back()}>Hủy</Button>
        </div>
      </Form>
    </PageContainer>
  );
};

export default DeThiForm;
