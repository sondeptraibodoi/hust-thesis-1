import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import ColorButton from "@/components/Button";
import { renderMath } from "@/components/TrangThaiCellRender/utils";
import { STATUS_QUESTION } from "@/constant";
import { GiaoVien } from "@/interface/giaoVien";
import { HocPhanCauHoi, HocPhanCauHoiChuong } from "@/interface/hoc-phan";
import { CauHoiView } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-view";
import { DatePicker, Form, Modal, Select, notification } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { FC, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";
import "../cau-hoi/cau-hoi.css";
interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  setIsEdit: (value: boolean) => void;
  isEdit: boolean;
  translation: string;
  icon?: ReactElement;
  data?: HocPhanCauHoiChuong[];
  dataItem: HocPhanCauHoi | undefined;
  giaoVien: GiaoVien[];
  readonlyCauHoi?: boolean;
}
const CreatNEditPhanBienDialog: FC<Props> = ({
  showModal,
  setShowModal,
  translation,
  isEdit,
  icon,
  data,
  dataItem,
  giaoVien,
  setKeyRender,
  setIsEdit,
  readonlyCauHoi
}) => {
  const { t } = useTranslation(translation);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingHuy, setLoadingHuy] = useState(false);
  const [optionGv, setOptionGv] = useState<any>([]);
  const [cauHoiId, setCauHoiId] = useState<number[]>([]);

  const onHuyCauHoi = async (cau_hoi: any) => {
    if (!cau_hoi) {
      return;
    }
    setLoadingHuy(true);
    try {
      await cauHoiApi.huyCauHoi(cau_hoi.id);
      api.success({
        message: t("message.success_delete"),
        description: t("message.success_desc_delete")
      });
    } catch (err: any) {
      api.error({
        message: t("message.error_delete"),
        description: t("message.error_desc_delete")
      });
    } finally {
      setShowModal(false);
      setIsEdit(false);
      form.resetFields();
      setKeyRender(Math.random());
      setLoadingHuy(false);
    }
  };
  const onFinish = async (values: any) => {
    setLoading(true);
    if (values.ngay_han_phan_bien) {
      values.ngay_han_phan_bien = dayjs(values.ngay_han_phan_bien).format("YYYY-MM-DD");
    }

    const phan_bien_id = dataItem?.cau_hoi_phan_bien[0] ? dataItem?.cau_hoi_phan_bien[0]?.id : false;

    try {
      if (isEdit && phan_bien_id) {
        await cauHoiApi.put({ ...values, phan_bien_id });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
      } else {
        await cauHoiApi.post(values);
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_add")
        });
      }
    } catch (err: any) {
      api.error({
        message: t("message.error_add"),
        description: err.response.data?.message ? err.response.data.message : t("message.error_desc_add")
      });
    } finally {
      setShowModal(false);
      form.resetFields();
      setKeyRender(Math.random());
      setLoading(false);
      setIsEdit(false);
      setCauHoiId([]);
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setIsEdit(false);
    setCauHoiId([]);
  };

  useEffect(() => {
    isEdit
      ? dataItem &&
        form.setFieldsValue({
          ...dataItem,
          cau_hoi_id: [dataItem?.id],
          giao_vien_id: dataItem?.cau_hoi_phan_bien[0]?.giao_vien_id,
          ngay_han_phan_bien:
            dataItem?.cau_hoi_phan_bien[0]?.ngay_han_phan_bien &&
            dayjs(dataItem?.cau_hoi_phan_bien[0]?.ngay_han_phan_bien)
        })
      : readonlyCauHoi &&
        form.setFieldsValue({
          ...dataItem,
          cau_hoi_id: [dataItem?.id]
        });
  }, [isEdit, dataItem, showModal]);

  const optionCauHoi = data?.map((item: HocPhanCauHoiChuong) => {
    return {
      value: item.cau_hoi_id,
      label: renderMath(item.cau_hoi.noi_dung),
      createBy: item.cau_hoi.created_by?.info_id
    };
  });

  // Lọc gv tạo khỏi câu hỏi đã chọn
  useEffect(() => {
    const cauHoiCreatedBy: any = data
      ?.filter((item: any) => {
        return cauHoiId.includes(item.cau_hoi_id);
      })
      .map((item: any) => item?.cau_hoi?.created_by?.info_id);

    const optionGvFormCreate = giaoVien
      .filter((item: any) => (cauHoiCreatedBy ? !cauHoiCreatedBy.includes(item.id) : true))
      .map((item: any) => {
        return {
          value: item.id,
          label: (
            <>
              <p>{item.name}</p>
              <p>{item.email}</p>
            </>
          ),
          searchLabel: `${item.name}`
        };
      });

    const optionGvFormEdit = giaoVien
      .filter((item: GiaoVien) => item.id !== dataItem?.created_by?.info?.id)
      .map((item: GiaoVien) => ({
        value: item.id,
        label: (
          <>
            <p>{item.name}</p>
            <p>{item.email}</p>
          </>
        ),
        searchLabel: item.name
      }));

    setOptionGv(dataItem ? optionGvFormEdit : optionGvFormCreate);
  }, [cauHoiId, showModal]);

  const disabledDate = (current: any) => {
    // Không chọn ngày nhỏ hơn hiện tại
    return current && current < dayjs().startOf("day");
  };

  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()} width={570}>
        <div className="model-container">
          <div className="model-icon create-icon">
            <div>{icon ? icon : <SiMicrosoftexcel />}</div>
          </div>

          <div className="">
            <Title level={4}>
              {dataItem?.trang_thai == STATUS_QUESTION.CHO_PHAN_BIEN2
                ? t("title.confirm")
                : dataItem?.trang_thai &&
                    [STATUS_QUESTION.CHO_DUYET1, STATUS_QUESTION.CHO_DUYET2].includes(dataItem?.trang_thai)
                  ? t("title.edit")
                  : t("title.create_new")}
            </Title>

            <p>
              {isEdit && dataItem?.trang_thai == STATUS_QUESTION.CHO_PHAN_BIEN2
                ? t("sub_title.confirm")
                : isEdit
                  ? t("sub_title.edit")
                  : t("sub_title.create_new")}
            </p>
          </div>
          <Form
            form={form}
            name="control-hooks"
            onFinish={onFinish}
            layout="vertical"
            style={{ maxWidth: 600 }}
            className="overflow-y-scroll base-form flex-grow-1"
          >
            <Form.Item
              label={t("field.cau_hoi")}
              name="cau_hoi_id"
              rules={[
                { required: true },
                {
                  validator: async (_rule, value) => {
                    const giaoVienId = form.getFieldValue("giao_vien_id");

                    // Xử lý nếu chọn câu hỏi trùng với giaos viên tạo
                    const invalidOptions: any = optionCauHoi?.filter(
                      (option) => value?.includes(option.value) && option.createBy === giaoVienId
                    );

                    if (!dataItem && invalidOptions.length > 0) {
                      return Promise.reject(t("rules.error_cau_hoi_trung_giao_vien"));
                    }

                    return Promise.resolve();
                  }
                }
              ]}
            >
              {isEdit || readonlyCauHoi ? (
                <CauHoiView cauHoi={dataItem} readonly />
              ) : (
                <Select
                  className="option_cauHoi"
                  showSearch
                  placeholder={t("field.cau_hoi")}
                  allowClear
                  disabled={isEdit}
                  filterOption={(input, option) => {
                    return (option?.label?.props?.mathString ?? "").toLowerCase().includes(input.toLowerCase());
                  }}
                  onChange={(e: any) => {
                    setCauHoiId(e);
                  }}
                  mode={"multiple"}
                  options={optionCauHoi}
                />
              )}
            </Form.Item>
            <Form.Item label={t("field.giao_vien_phan_bien")} name="giao_vien_id" rules={[{ required: true }]}>
              <Select
                allowClear
                showSearch
                style={{ width: "100%" }}
                placeholder={t("field.giao_vien_phan_bien")}
                filterOption={(input, option) => {
                  return (option?.searchLabel ?? "").toLowerCase().includes(input.toLowerCase());
                }}
                onChange={() => form.validateFields(["cau_hoi_id"])}
                options={optionGv}
              />
            </Form.Item>
            <Form.Item label={t("field.ngay_han_phan_bien")} name="ngay_han_phan_bien" rules={[{ required: true }]}>
              <DatePicker format={"DD/MM/YYYY"} className="w-full" allowClear disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
              <div className="flex justify-between gap-4">
                <ColorButton block onClick={() => handleCancel()}>
                  {t("action.cancel")}
                </ColorButton>
                <ColorButton block htmlType="submit" loading={loading} type="primary">
                  {t("action.accept")}
                </ColorButton>
                {isEdit && dataItem && dataItem.trang_thai === STATUS_QUESTION.DANG_SU_DUNG && (
                  <ColorButton block onClick={() => onHuyCauHoi(dataItem)} loading={loadingHuy} danger>
                    {t("action.delete")}
                  </ColorButton>
                )}
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default CreatNEditPhanBienDialog;
