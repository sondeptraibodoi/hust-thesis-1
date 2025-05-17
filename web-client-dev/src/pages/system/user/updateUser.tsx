import userApi from "@/api/admin/user.api";
import { convertErrorAxios } from "@/api/axios";
import maHocPhan from "@/api/maHocPhan/maHocPhan.api";
import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { ROLE, User } from "@/interface/user";
import { CloseOutlined } from "@ant-design/icons";
import type { SelectProps } from "antd";
import { Form, Input, Modal, notification, Select, Tag } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";

type TagRender = SelectProps["tagRender"];
interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  data: User;
  setKeyRender: (value: number) => void;
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
}
const UpdateUser: FC<Props> = ({ showModal, setShowModal, data, setKeyRender, isEdit, setIsEdit }) => {
  const { t } = useTranslation("user-manager-modal");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [troLyHocPhan, setTroLyHocPhan] = useState(false);
  const [optionHocPhan, setOptionHocPhan] = useState<any[]>([]);
  const [showHp, setShowHp] = useState(false);
  const [dataHp, setDataHp] = useState<string[]>([]);
  const [htmlHp, setHtmlHp] = useState(<></>);

  const option = [
    { value: ROLE.admin, label: "Quản trị" },
    { value: ROLE.assistant, label: "Trợ lý" },
    { value: ROLE.teacher, label: "Giảng viên" },
    {
      value: ROLE.hp_assistant,
      label: "Trưởng nhóm chuyên môn"
    },
    {
      value: ROLE.hp_office,
      label: "Trợ lý văn phòng"
    }
    // { value: "student", label: "Sinh viên" },
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
      //
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
  useEffect(() => {
    if (!data.roles) return;
    if (data.roles.includes(ROLE.student)) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [data]);
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await userApi.edit({ ...data, ...values });
      api.success({
        message: t("message.success_edit"),
        description: t("message.success_desc_edit")
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
          message: t("message.error_edit"),
          description: t("message.error_desc_edit")
        });
        const { response } = res.error;
        if (response) setErrorMessage(response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setErrorMessage(null);
    setIsEdit(false);
    resetDialog();
  };
  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
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
  useEffect(() => {
    if (data && isEdit) {
      form.setFieldsValue(data);
      if (data.roles.includes(ROLE.hp_assistant)) {
        setTroLyHocPhan(true);
        data.hoc_phan_quan_ly.map((item: any) => dataHp.push(item.ma_hoc_phan));
        SetHtmlHp();
      }
    }
  }, [data, form, isEdit]);
  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()}>
        <>
          <div className="create-icon">
            <div>
              <SiMicrosoftexcel />
            </div>
          </div>
          <div className="modal-title-wapper">
            <p className="modal-title">{t("title.edit")}</p>
            <p>{t("sub_title.edit")}</p>
          </div>
        </>
        <Form layout="vertical" className="base-form" onFinish={onFinish} form={form}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: t("required.username") }]}
            validateStatus={validateForm(errorMessage?.errors?.username?.length)}
            help={errorMessage?.errors?.username ? errorMessage?.errors?.username[0] : undefined}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            name="roles"
            label="Vai trò"
            rules={[{ required: true }]}
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
            <Select mode="multiple" options={option} disabled={disabled}></Select>
          </Form.Item>

          {troLyHocPhan && (
            <Form.Item
              initialValue={"Chọn học phần"}
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
                mode="multiple"
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
                {t("action.edit")}
              </ColorButton>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateUser;
