import { convertErrorAxios } from "@/api/axios";
import maHocPhan from "@/api/maHocPhan/maHocPhan.api";
import taiLieuHocPhanApi from "@/api/taiLieu/hocPhanQuanLy.api";
import loaiTaiLieuApi from "@/api/taiLieu/loaiTaiLieu.api";
import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { HocPhanUser } from "@/interface/hoc-phan";
import { LoaiTaiLieu, TaiLieuChung } from "@/interface/tai-lieu";
import { TaiLieuHocPhan } from "@/interface/taiLieu";
import { ROLE } from "@/interface/user";
import type { TabsProps } from "antd";
import { Checkbox, Form, Input, Modal, Select, Switch, Tabs, notification } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  isEdit: boolean;
  data?: any;
  setEdit: (value: boolean) => void;
  ma_hoc_phan: HocPhanUser;
  dataUpdate?: any;
}
const { Option } = Select;
const { TextArea } = Input;
const ThemTaiLieuDialog: FC<Props> = ({
  showModal,
  setShowModal,
  setKeyRender,
  isEdit,
  data,
  setEdit,
  ma_hoc_phan,
  dataUpdate
}) => {
  const { t } = useTranslation("tai-lieu-chung");
  const [form] = Form.useForm();
  const [formCheckBoxTaiLieu] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [isChecked, setIschecked] = useState(data);
  const [loaiTaiLieuList, setLoaiTaiLieuList] = useState<LoaiTaiLieu[]>([]);
  const [listTaiLieuGV, setListTaiLieuGV] = useState<TaiLieuChung[]>([]);
  const [listMaHp, setListMaHp] = useState<any[]>([]);
  const [id_hp, setId_hp] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);

  const handleChange = (name: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (name && updatedErrors[name]) {
        updatedErrors[name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };
  const GetHocPhan = async () => {
    try {
      await maHocPhan.list().then((response: any) => {
        response.data.map(
          (item: any) =>
            item.ma != ma_hoc_phan.ma_hoc_phan &&
            listMaHp.push({
              value: item.id,
              label: <div className="w-full text-sm py-1">{item.ma + "-" + item.ten_hp}</div>
            })
        );
      });
      setListMaHp(listMaHp);
    } finally {
    }
  };
  useEffect(() => {
    setIschecked(dataUpdate?.trang_thai === "1-Đang sử dụng");
    if (!isEdit) setIschecked(true);
  }, [dataUpdate, isEdit]);

  const getTrangThaiValue = () => {
    return isChecked ? "1-Đang sử dụng" : "2-Dừng sử dụng";
  };
  const onFinishTaiLieuLop = async () => {
    setLoading(true);
    try {
      await taiLieuHocPhanApi.copy(ma_hoc_phan, id_hp);
      api.success({
        message: t("message.success_add"),
        description: t("message.success_desc_add")
      });
      setShowModal(false);
      formCheckBoxTaiLieu.resetFields();
      setId_hp(0); //commit
      setIschecked(true);
      setKeyRender(Math.random());
      setListTaiLieuGV([]); //commit
    } catch (error) {
      api.error({
        message: t("message.error_add"),
        description: t("message.error_desc_add")
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: TaiLieuHocPhan) => {
    values.trang_thai = getTrangThaiValue();
    setLoading(true);
    if (isEdit) {
      try {
        await taiLieuHocPhanApi.edit({ ...dataUpdate, ...values });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        setShowModal(false);
        form.resetFields();
        setIschecked(true);
        setKeyRender(Math.random());
        setEdit(false);
        setErrorMessage(null);
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
    } else {
      try {
        await taiLieuHocPhanApi.create({
          ...values,
          ma_hoc_phan: ma_hoc_phan.ma_hoc_phan
        });
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        setShowModal(false);
        form.resetFields();
        setIschecked(true);
        setKeyRender(Math.random());
        setErrorMessage(null);
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
    }
  };
  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    setEdit(false);
    form.resetFields();
    setIschecked(true);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (isEdit && dataUpdate) {
      form.setFieldsValue({
        ...dataUpdate
      });
    }
  }, [form, dataUpdate, isEdit]);

  useEffect(() => {
    const getLoaiTaiLieu = async () => {
      try {
        const res = await loaiTaiLieuApi.list();
        if (res.data && res.data.length > 0) {
          res.data.map((item: any) => item.nhom == "Tài liệu học phần" && loaiTaiLieuList.push(item));
          setLoaiTaiLieuList(loaiTaiLieuList);
        }
      } catch (error) {
        api.error({
          message: "Lỗi khi lấy dữ liệu loại tài liệu",
          description:
            "Đã xảy ra lỗi trong quá trình lấy dữ liệu loại tài liệu, chúng tôi sẽ sớm khắc phục, vui lòng quay lại sau!"
        });
      }
    };
    GetHocPhan();
    getLoaiTaiLieu();
  }, [api, listMaHp]);

  const checkboxTaiLieuGVOptions = listTaiLieuGV.map((item) => ({
    label: item.ten,
    value: String(item.id)
  }));

  const handleLoaiTaiLieu = (e: any) => {
    const valueMa = form.getFieldsValue(["ma"]);
    const loaiTaiLieu = loaiTaiLieuList.filter((item: any) => item.id == e);
    const maTaiLieu = loaiTaiLieuList.filter((item: any) => item.ma == valueMa.ma).length;
    if ((valueMa.ma == undefined || valueMa.ma == "" || maTaiLieu > 0) && !isEdit) {
      form.setFieldsValue({ ma: loaiTaiLieu[0].ma });
    }
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thêm tài liệu mới",
      children: (
        <>
          <div className="model-container">
            <div className="model-icon create-icon">
              <div>
                <SiMicrosoftexcel />
              </div>
            </div>
            <div className="modal-title-wapper ">
              <p className="modal-title">{isEdit ? t("title.edit") : t("title.create_new")}</p>
              <p>{isEdit ? t("sub_title.edit") : t("sub_title.create_new")}</p>
            </div>
            <div className="scrollable-content">
              <Form
                initialValues={{ role_code: ROLE.teacher }}
                layout="vertical"
                className="base-form flex-grow-1 overflow-y-auto"
                onFinish={onFinish}
                form={form}
              >
                <Form.Item
                  label="Loại tài liệu"
                  name="loai_tai_lieu_id"
                  rules={[{ required: true, message: t("required.loai_tai_lieu_id") }]}
                  validateStatus={validateForm(errorMessage?.errors?.loai_tai_lieu_id?.length)}
                  help={errorMessage?.errors?.loai_tai_lieu_id ? errorMessage?.errors?.loai_tai_lieu_id[0] : undefined}
                >
                  <Select
                    allowClear
                    onChange={(e) => {
                      handleChange("loai_tai_lieu_id");
                      handleLoaiTaiLieu(e);
                    }}
                    filterOption={(input, option) => {
                      const searchText = input.toLowerCase();
                      const label = String(option?.label).toLowerCase();
                      return label?.includes(searchText);
                    }}
                  >
                    {renderOption(loaiTaiLieuList)}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Mã tài liệu"
                  name="ma"
                  rules={[{ required: true, message: t("required.ma") }]}
                  validateStatus={validateForm(errorMessage?.errors?.ma?.length)}
                  help={errorMessage?.errors?.ma ? errorMessage?.errors?.ma[0] : undefined}
                >
                  <Input allowClear onChange={() => handleChange("ma")}></Input>
                </Form.Item>
                <Form.Item
                  label="Tên tài liệu"
                  name="ten"
                  rules={[{ required: true, message: t("required.ten") }]}
                  validateStatus={validateForm(errorMessage?.errors?.ten?.length)}
                  help={errorMessage?.errors?.ten ? errorMessage?.errors?.ten[0] : undefined}
                >
                  <Input allowClear onChange={() => handleChange("ten")}></Input>
                </Form.Item>

                <Form.Item
                  label="Mô tả chi tiết"
                  name="mo_ta"
                  validateStatus={validateForm(errorMessage?.errors?.mo_ta?.length)}
                  help={errorMessage?.errors?.mo_ta ? errorMessage?.errors?.mo_ta[0] : undefined}
                >
                  <TextArea allowClear rows={4} onChange={() => handleChange("mo_ta")} />
                </Form.Item>

                <Form.Item
                  label="Link tài liệu"
                  name="link"
                  rules={[{ required: true, message: t("required.link") }]}
                  validateStatus={validateForm(errorMessage?.errors?.link?.length)}
                  help={errorMessage?.errors?.link ? errorMessage?.errors?.link[0] : undefined}
                >
                  <Input allowClear onChange={() => handleChange("link")}></Input>
                </Form.Item>

                <Form.Item label="Trạng thái" name="trang_thai">
                  <Switch
                    checked={isChecked}
                    onChange={() => {
                      setIschecked(!isChecked);
                    }}
                  />
                </Form.Item>
              </Form>
            </div>
            <Form.Item className="bottom-0 right-0 left-0 pt-4 bg-white">
              <div className="flex justify-between gap-4">
                <ColorButton block onClick={handleCancel}>
                  {t("action.cancel")}
                </ColorButton>
                <ColorButton block loading={loading} type="primary" onClick={() => form.submit()}>
                  {t("action.accept")}
                </ColorButton>
              </div>
            </Form.Item>
          </div>
        </>
      )
    },
    ...(isEdit
      ? []
      : [
          {
            key: "2",
            label: "Thêm tài liệu từ học phần khác",
            children: (
              <>
                <div className="model-container">
                  <div className="model-icon create-icon">
                    <div>
                      <SiMicrosoftexcel />
                    </div>
                  </div>
                  <div className="modal-title-wapper ">
                    <p className="modal-title">Thêm tài liệu </p>
                  </div>

                  <Form
                    layout="vertical"
                    className="base-form"
                    onFinish={onFinishTaiLieuLop}
                    form={formCheckBoxTaiLieu}
                  >
                    {listMaHp.length >= 0 && (
                      <Form.Item
                        name="hoc_phan"
                        label="Sao chép từ học phần khác"
                        rules={[{ required: true, message: t("required.ma_hoc_phan") }]}
                        validateStatus={validateForm(errorMessage?.errors?.hoc_phan)}
                        help={errorMessage?.errors?.hoc_phan ? errorMessage?.errors?.hoc_phan : undefined}
                      >
                        <Select
                          onChange={(value) => {
                            handleChange("hoc_phan");
                            setId_hp(value);
                          }}
                          options={listMaHp}
                        ></Select>
                      </Form.Item>
                    )}

                    <Form.Item name="tai_lieu_ids">
                      <Checkbox.Group
                        style={{ display: "flex", flexDirection: "column" }}
                        options={checkboxTaiLieuGVOptions}
                      />
                    </Form.Item>

                    <Form.Item className="absolute bottom-0 right-0 left-0 pt-4 bg-white">
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
                </div>
              </>
            )
          }
        ])
  ];

  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()} width={570}>
        <Tabs defaultActiveKey="1" items={items} />
      </Modal>
    </>
  );
};

export default ThemTaiLieuDialog;

const renderOption = (data: LoaiTaiLieu[]) => {
  if (!Array.isArray(data)) return <></>;
  if (!data || !data.length) return <></>;
  return (
    <>
      {data.map((item) => (
        <Option key={item.id} value={item.id} label={item.ma}>
          {`${item.ma} - ${item.loai}`}
        </Option>
      ))}
    </>
  );
};
