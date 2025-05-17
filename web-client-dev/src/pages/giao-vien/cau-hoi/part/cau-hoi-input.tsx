import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isEditingDisabled: boolean;
  isEdit?: boolean;
}

export const CauHoiForm: FC<Props> = ({ isEditingDisabled, isEdit }) => {
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");

  const createLuaChon = () => ({
    id: uuidv4().replace(/-/g, ""),
    content: "",
    checked: false,
    correct: false
  });

  const addLuaChon = (add: (defaultValue?: any) => void) => {
    add(createLuaChon());
  };

  return (
    <>
      <Typography.Title level={5}>{t("field.is_machine")}</Typography.Title>
      <Form.Item name="is_machine" valuePropName="checked">
        <Checkbox disabled={isEdit}>Tích chọn nếu câu hỏi sinh tự động</Checkbox>
      </Form.Item>
      <Typography.Title level={5}>{t("field.noi_dung")}</Typography.Title>
      <Form.Item
        name="noi_dung"
        rules={[
          {
            required: true,
            message: "Hãy nhập thông tin cho trường nội dung."
          }
        ]}
      >
        <Input.TextArea rows={4} placeholder="Nhập tiêu đề câu hỏi" disabled={isEditingDisabled} />
      </Form.Item>
      <Typography.Title level={5}>{t("field.loi_giai")}</Typography.Title>
      <Form.Item name="loi_giai">
        <Input.TextArea rows={4} placeholder="Nhập lời giải câu hỏi" disabled={isEditingDisabled} />
      </Form.Item>
      <Typography.Title level={5}>{t("field.lua_chon")}</Typography.Title>
      <Form.Item hidden name="dap_an">
        <Input></Input>
      </Form.Item>
      <Form.List
        name="lua_chon"
        initialValue={[
          { id: "uuid1", content: "", checked: false, correct: false },
          { id: "uuid2", content: "", checked: false, correct: false },
          { id: "uuid3", content: "", checked: false, correct: false },
          { id: "uuid4", content: "", checked: false, correct: false }
        ]}
        rules={[
          {
            validator: async (_, names) => {
              if (!names || names.length < 2) {
                return Promise.reject(new Error("Cần ít nhất 2 đáp án"));
              }
              const count_dap_an = names.filter((x: any) => x.correct).map((x: any) => x.id);
              if (count_dap_an.length < 1) {
                return Promise.reject(new Error("Cần ít nhất 1 đáp án đúng"));
              }
            }
          }
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item label={`Đáp án ${index + 1}`} key={field.key}>
                <div className="d-flex gap-2">
                  <Form.Item
                    {...field}
                    noStyle
                    className="flex-0"
                    key={index + "correct"}
                    name={[field.name, "correct"]}
                    valuePropName="checked"
                    hasFeedback={false}
                  >
                    <Checkbox disabled={isEditingDisabled} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    noStyle
                    className="flex-1"
                    key={index + "content"}
                    name={[field.name, "content"]}
                    rules={[
                      {
                        required: true,
                        message: "Hãy nhập thông tin đáp án."
                      }
                    ]}
                    hasFeedback={false}
                  >
                    <Input.TextArea rows={2} placeholder="Nhập nội dung đáp án" disabled={isEditingDisabled} />
                  </Form.Item>
                  <Button
                    className="flex-0"
                    type="link"
                    danger
                    disabled={fields.length < 2 || isEditingDisabled}
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </div>
              </Form.Item>
            ))}
            <Form.ErrorList errors={errors} />
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => addLuaChon(add)}
                style={{ width: "100%" }}
                disabled={isEditingDisabled}
              >
                <PlusOutlined /> Thêm Câu Trả Lời
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
};
