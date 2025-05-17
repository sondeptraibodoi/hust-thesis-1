import { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select, notification, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { SiMicrosoftexcel } from "react-icons/si";
import { convertErrorAxios } from "@/api/axios";
import { useTranslation } from "react-i18next";
import userApi from "@/api/admin/user.api";
import maHocPhan from "@/api/maHocPhan/maHocPhan.api";
import type { SelectProps } from "antd";
import { ROLE_NAME } from "@/constant";
import { ROLE } from "@/interface/user";
type TagRender = SelectProps["tagRender"];
interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
}
const CreateUser: FC<Props> = ({ showModal, setShowModal, setKeyRender }) => {
  const { t } = useTranslation("user-manager-modal");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);
  const [troLyHocPhan, setTroLyHocPhan] = useState(false);
  const [optionHocPhan, setOptionHocPhan] = useState<any[]>([]);
  const [showHp, setShowHp] = useState(false);
  const [dataHp, setDataHp] = useState<string[]>([]);
  const [htmlHp, setHtmlHp] = useState(<></>);
  const option = [
    { value: ROLE.admin, label: ROLE_NAME[ROLE.admin] },
    { value: ROLE.assistant, label: ROLE_NAME[ROLE.assistant] },
    { value: ROLE.teacher, label: ROLE_NAME[ROLE.teacher] },
    { value: ROLE.hp_assistant, label: ROLE_NAME[ROLE.hp_assistant] },
    { value: ROLE.hp_office, label: ROLE_NAME[ROLE.hp_office] }
    // { value: "student", label: "Student" },
  ];

  const getHocPhan = async () => {
    try {
      await maHocPhan.list().then((response: any) => {
        if (response.data.length > 0) {
          for (let x = 0; x < response.data.length; x++) {
            optionHocPhan.push({
              id: response.data[x].id,
              label: <Tag className="w-full text-base">{response.data[x].ma + " - " + response.data[x].ten_hp}</Tag>,
              value: response.data[x].ma
            });
          }
          setOptionHocPhan(optionHocPhan);
        }
      });
    } finally {
      setTroLyHocPhan(false);
    }
  };
  const handleChange = (name: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (name && updatedErrors[name]) {
        updatedErrors[name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await userApi.create(values);
      api.success({
        message: t("message.success_add"),
        description: t("message.success_desc_add")
      });
      setShowModal(false);
      form.resetFields();
      setKeyRender(Math.random());
      resetDialog();
    } catch (err: any) {
      const res = convertErrorAxios<LaravelValidationResponse>(err);
      setErrorMessage(err.data);
      if (res.type === "axios-error") {
        api.error({
          message: t("message.error_add"),
          description: t("message.error_desc_add")
        });
        const { response } = res.error;
        if (response) setErrorMessage(response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setErrorMessage(null);
    resetDialog();
  };
  const resetDialog = () => {
    setHtmlHp(<></>);
    setDataHp([]);
    setShowHp(false);
    setTroLyHocPhan(false);
  };
  const SetHtmlHp = () => {
    if (dataHp.length > 0) {
      setShowHp(true);
      setHtmlHp(
        <Tag className="w-full">
          {optionHocPhan.map((item: any, index: number) =>
            dataHp.map(
              (tag: any) =>
                tag === item.value && (
                  <div className="w-full my-1 text-gray-400 flex justify-between" key={index}>
                    {item.label}{" "}
                    <CloseOutlined
                      onClick={() => {
                        CloseMaLop(item.value);
                      }}
                    />
                  </div>
                )
            )
          )}
        </Tag>
      );
    } else {
      setShowHp(false);
      setHtmlHp(<></>);
    }
  };
  const CloseMaLop = (maHp: string) => {
    for (let i = 0; i < dataHp.length; i++) {
      if (maHp === dataHp[i]) {
        dataHp.splice(i, 1);
      }
    }
    setDataHp(dataHp);
    SetHtmlHp();
    form.setFieldsValue({ hoc_phan: dataHp });
  };
  const tagRender: TagRender = () => {
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return <div onMouseDown={onPreventMouseDown}></div>;
  };
  useEffect(() => {
    getHocPhan();
  }, []);
  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()}>
        <div className="create-icon">
          <div>
            <SiMicrosoftexcel />
          </div>
        </div>
        <div className="modal-title-wapper">
          <p className="modal-title">{t("title.create_new")}</p>
          <p>{t("sub_title.create_new")}</p>
        </div>
        <Form
          initialValues={{ role_code: ROLE.student }}
          layout="vertical"
          className="base-form"
          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: t("required.username") }]}
            validateStatus={validateForm(errorMessage?.errors?.username?.length)}
            help={errorMessage?.errors?.username ? errorMessage?.errors?.username[0] : undefined}
          >
            <Input onChange={() => handleChange("username")}></Input>
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: t("required.password") }]}
            validateStatus={validateForm(errorMessage?.errors?.password?.length)}
            help={errorMessage?.errors?.password ? errorMessage?.errors?.password[0] : undefined}
          >
            <Input.Password onChange={() => handleChange("password")}></Input.Password>
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmpassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Xác nhận mật khẩu của bạn!"
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không trùng khớp"));
                }
              })
            ]}
            validateStatus={validateForm(errorMessage?.errors?.confirmpass?.length)}
            help={errorMessage?.errors?.confirmpass ? errorMessage?.errors?.confirmpass[0] : undefined}
          >
            <Input.Password onChange={() => handleChange("confirmpass")}></Input.Password>
          </Form.Item>
          <Form.Item
            label="Vai trò"
            name="roles"
            rules={[{ required: true, message: t("required.role_code") }]}
            validateStatus={validateForm(errorMessage?.errors?.role_code?.length)}
            help={errorMessage?.errors?.roles ? errorMessage?.errors?.roles[0] : undefined}
            getValueFromEvent={(value) => {
              for (let i = 0; i < value.length; i++) {
                if (value[i] == ROLE.hp_assistant) {
                  setTroLyHocPhan(true);
                  return value;
                }
              }
              setTroLyHocPhan(false);
              setShowHp(false);
              setTroLyHocPhan(false);
              setDataHp([]);
              return value;
            }}
          >
            <Select
              mode="multiple"
              options={option}
              onChange={() => {
                handleChange("roles");
              }}
            ></Select>
          </Form.Item>

          {troLyHocPhan && (
            <Form.Item
              label="Học phần"
              name="style"
              rules={[{ required: true, message: t("required.hoc_phan") }]}
              validateStatus={validateForm(errorMessage?.errors?.hoc_phan?.length)}
              help={errorMessage?.errors?.roles ? errorMessage?.errors?.hoc_phan[0] : undefined}
              getValueFromEvent={() => {
                return "Chọn học phần";
              }}
            >
              <Select
                mode="tags"
                tagRender={tagRender}
                placeholder={"Chọn học phần"}
                options={optionHocPhan.filter((item) => dataHp.indexOf(item.value) === -1)}
                onChange={(value) => {
                  const a = value.length;
                  const x = optionHocPhan.filter((item: any) => item.value === value[a - 1])[0];
                  for (let i = 0; i < dataHp.length; i++) {
                    if (x.value == dataHp[i]) {
                      form.setFieldsValue({ hoc_phan: dataHp });
                      return;
                    }
                  }

                  dataHp.push(x.value);
                  setDataHp(dataHp);
                  form.setFieldsValue({ hoc_phan: dataHp });
                  SetHtmlHp();
                  handleChange("hoc_phan");
                }}
              ></Select>
            </Form.Item>
          )}
          {showHp && <Form.Item name="hoc_phan">{htmlHp}</Form.Item>}
          <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
            <div className="flex justify-between gap-4">
              <ColorButton block onClick={handleCancel}>
                {t("action.cancel")}
              </ColorButton>
              <ColorButton block htmlType="submit" loading={loading} type="primary">
                {t("action.accept")}
              </ColorButton>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateUser;
