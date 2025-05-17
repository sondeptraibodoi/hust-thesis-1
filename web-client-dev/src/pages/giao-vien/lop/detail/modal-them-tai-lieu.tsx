import { Checkbox, Form, Input, Modal, Select, Switch, notification } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { LoaiTaiLieu, TaiLieuChung } from "@/interface/tai-lieu";

import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { Lop } from "@/interface/lop";
import { ROLE } from "@/interface/user";
import { SiMicrosoftexcel } from "react-icons/si";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { convertErrorAxios } from "@/api/axios";
import loaiTaiLieuApi from "@/api/taiLieu/loaiTaiLieu.api";
import lopHocApi from "@/api/lop/lopCuaGiaoVien.api";
import taiLieuGiaoVienApi from "@/api/taiLieu/taiLieuGiaoVien.api";
import { useTranslation } from "react-i18next";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  isEdit: boolean;
  data?: any;
  setEdit: (value: boolean) => void;
  lop: Lop;
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
  lop,
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
  const [selectedTaiLieuIds, setSelectedTaiLieuIds] = useState<number[]>([]);
  const [listLopDayGV, setListLopDayGV] = useState<Lop[]>([]);
  const [idLopCopy, setIdLopCopy] = useState<number>();

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
      await taiLieuGiaoVienApi.copyTaiLieuLop(
        selectedTaiLieuIds.map((id: number) => parseInt(String(id))),
        lop.id
      );
      api.success({
        message: t("message.success_add"),
        description: t("message.success_desc_add")
      });
      setShowModal(false);
      formCheckBoxTaiLieu.resetFields();
      setIdLopCopy(0); //commit
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

  const onFinish = async (values: any) => {
    values.trang_thai = getTrangThaiValue();
    setLoading(true);
    if (isEdit) {
      try {
        await taiLieuGiaoVienApi.update({ ...dataUpdate, ...values });
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
        await taiLieuGiaoVienApi.addTaiLieuLop(values, lop.id);
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
          const filteredData = res.data.filter((item: LoaiTaiLieu) => item.nhom === "Tài liệu lớp môn");
          setLoaiTaiLieuList(filteredData);
        }
      } catch (error) {
        api.error({
          message: "Lỗi khi lấy dữ liệu loại tài liệu",
          description:
            "Đã xảy ra lỗi trong quá trình lấy dữ liệu loại tài liệu, chúng tôi sẽ sớm khắc phục, vui lòng quay lại sau!"
        });
      }
    };

    getLoaiTaiLieu();
  }, [api]);

  useEffect(() => {
    const getLopDayGV = async () => {
      try {
        const res = await lopHocApi.list();
        if (res.data.length > 0) {
          setListLopDayGV(res.data);
        } else {
          setListLopDayGV([]);
        }
      } finally {
        <></>;
      }
    };

    getLopDayGV();
  }, []);

  const getTaiLieuLopCopy = useCallback(async () => {
    setLoading(true);
    let items: TaiLieuChung[] = [];
    try {
      const res = await taiLieuGiaoVienApi.lopTaiLieu(idLopCopy ?? 0);
      items = res.data;
      setListTaiLieuGV(items);
      formCheckBoxTaiLieu.setFieldValue(
        "tai_lieu_ids",
        items.map((item) => "" + item.id)
      );
      setSelectedTaiLieuIds(formCheckBoxTaiLieu.getFieldsValue().tai_lieu_ids);
    } finally {
      setLoading(false);
    }
  }, [idLopCopy]);

  useEffect(() => {
    if (idLopCopy) {
      getTaiLieuLopCopy();
    }
  }, [idLopCopy, getTaiLieuLopCopy]);

  const handleTaiLieuCheckboxChange = (checkedValues: any[]) => {
    setSelectedTaiLieuIds(checkedValues);
  };

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
            <Form.Item className=" bottom-0 right-0 left-0 pt-4 bg-white">
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
            label: "Thêm tài liệu từ lớp khác",
            children: (
              <>
                <div className="model-container">
                  <div className="model-icon create-icon">
                    <div>
                      <SiMicrosoftexcel />
                    </div>
                  </div>
                  <div className="modal-title-wapper ">
                    <p className="modal-title">Thêm tài liệu lớp</p>
                    <p>Thêm tài liệu cho lớp mã {lop.ma}</p>
                  </div>
                  {/* <Button type="primary" ghost style={{width: "30%"}}>Sao chép từ lớp khác</Button> */}
                  <Form
                    initialValues={{ role_code: ROLE.teacher }}
                    layout="vertical"
                    className="base-form"
                    onFinish={onFinishTaiLieuLop}
                    form={formCheckBoxTaiLieu}
                  >
                    <Form.Item name="lop_tai_lieu_id" label="Sao chép từ lớp khác">
                      <Select
                        onChange={(value) => {
                          handleChange("lop_tai_lieu_id");
                          setIdLopCopy(value);
                        }}
                        filterOption={(input, option) => {
                          const searchText = input.toLowerCase();
                          const label = String(option?.label).toLowerCase();
                          return label?.includes(searchText);
                        }}
                      >
                        {renderLopDayGV(listLopDayGV, lop)}
                      </Select>
                    </Form.Item>

                    <Form.Item name="tai_lieu_ids">
                      <Checkbox.Group
                        style={{ display: "flex", flexDirection: "column" }}
                        onChange={handleTaiLieuCheckboxChange}
                        options={checkboxTaiLieuGVOptions}
                      />
                    </Form.Item>

                    <Form.Item className="absolute bottom-0 right-0 left-0 pt-4 bg-white">
                      <div className="flex justify-between gap-4 actions-button">
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
      <Modal
        centered
        footer={<></>}
        className="relative lop-tai-lieu-dialog"
        open={showModal}
        onCancel={() => handleCancel()}
        width={570}
      >
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

const renderLopDayGV = (data: Lop[], lop: Lop) => {
  if (!Array.isArray(data)) return <></>;
  if (!data || !data.length) return <></>;

  const filteredData = data.filter((item) => {
    return item.id !== lop.id && Array.isArray(item.tai_lieus) && item.tai_lieus.length > 0;
  });

  return (
    <>
      {filteredData.map((item) => (
        <Option key={item.id} value={item.id} label={item.ma}>
          {`${item.ma} - ${item.ma_hp} - ${item.ten_hp}`}
        </Option>
      ))}
    </>
  );
};
