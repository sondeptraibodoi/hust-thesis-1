import { CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { Card, Form, Tabs } from "antd";
import { Dispatch, FC, SetStateAction } from "react";

import MaHpFormFields from "./cau-hoi-ma-hp-item";

export const MaHpTab: FC<{
  activeKey: string;
  setActiveKey: Dispatch<SetStateAction<string>>;
  isEditingDisabled: boolean;
  readOnly?: boolean;
}> = ({ activeKey, setActiveKey, isEditingDisabled, readOnly }) => {
  const form = Form.useFormInstance();
  const tabs = Form.useWatch("chuongs", form);
  return (
    <Form.List
      name="chuongs"
      initialValue={[{ is_primary: true, do_kho: "easy" }]}
      rules={[
        {
          validator: async (_, chuongs) => {
            if (!chuongs || chuongs.length < 1) {
              return Promise.reject(new Error("Cần chọn ít nhất 1 chủ đề"));
            }
          }
        },
        {
          validator: async (_, chuongs) => {
            if (!chuongs || chuongs.length < 1) {
              return;
            }
            if (hasDuplicates(chuongs)) {
              return Promise.reject(new Error("Học phần không được phép trùng"));
            }
          }
        },
        {
          validator: async (_, chuongs) => {
            if (!chuongs || chuongs.length < 1) {
              return;
            }
            if (chuongs.some((chuong: any) => !chuong || !chuong.chuong_id || !chuong.ma_hoc_phan || !chuong.do_kho)) {
              return Promise.reject(
                new Error("Dữ liệu học phần thiếu. Vui lòng điền đầy đủ tất cả các trường yêu cầu")
              );
            }
          }
        }
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <>
          <Tabs
            defaultActiveKey="0"
            onChange={setActiveKey}
            activeKey={activeKey}
            type={readOnly ? "line" : "editable-card"}
            onEdit={(_, action) => {
              if (action === "add") {
                add();
                setActiveKey(form.getFieldValue("chuongs").length - 1 + "");
              }
            }}
            className="text"
            items={fields.map((field, i) => ({
              label: (
                <>
                  {tabs && tabs[i] && tabs[i].ma_hoc_phan ? tabs[i].ma_hoc_phan : "Học phần " + (i + 1)}{" "}
                  {tabs && tabs[i] && tabs[i].is_primary && <CheckCircleOutlined style={{ fontSize: "16px" }} />}
                  {fields.length > 1 && (
                    <CloseOutlined
                      onClick={() => {
                        remove(field.name);
                        setActiveKey("0");
                        const value = form.getFieldValue("chuongs");
                        if (value.length == 1) {
                          value[0].is_primary = true;
                          form.setFieldValue("chuongs", value);
                        }
                      }}
                    />
                  )}
                </>
              ),
              key: i + "",
              closable: false,
              children: (
                <>
                  {readOnly ? (
                    <></>
                  ) : (
                    <Card size="small">
                      <MaHpFormFields field={field} key={i} name="chuongs" isEditingDisabled={isEditingDisabled} />{" "}
                    </Card>
                  )}
                </>
              )
            }))}
          />
          <Form.ErrorList errors={errors} />
        </>
      )}
    </Form.List>
  );
};
function hasDuplicates(array: any[]) {
  const seen = new Set();

  for (const item of array) {
    if (!item || !item.ma_hoc_phan) {
      continue;
    }
    if (seen.has(item.ma_hoc_phan)) {
      return true; // Duplicate found
    }
    seen.add(item.ma_hoc_phan);
  }

  return false; // No duplicates
}
