import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import maHocPhanApi from "@/api/maHocPhan/maHocPhan.api";
import { DialogContainerForm } from "@/components/dialog/dialog-container";
import { ROLE_CODE } from "@/constant";
import { useHandleError } from "@/hooks/useHandleError";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { checkUserRoleAllow, checkUserRoleAllowMultiple } from "@/interface/user/auth";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import { useQuery } from "@tanstack/react-query";
import { App, Form, Modal, Select } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const listDoKho = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" }
];

export const CauHoiChuongModal: FC<{
  open: boolean;
  setOpen: (value: boolean) => void;
  cauHoi: HocPhanCauHoi;
  onReset?: () => void;
}> = ({ open, setOpen, cauHoi, onReset }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { notification: api } = App.useApp();
  const { t } = useTranslation("common");
  const { handlePromise } = useHandleError({ form });
  const onCancel = () => {
    setOpen(false);
    form.resetFields();
    form.setFieldsValue({ do_kho: "easy" });
  };
  useEffect(() => {
    form.setFieldsValue({ do_kho: "easy" });
  }, []);
  const { data: dataHocPhan, isLoading: loadingHocPhan } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    enabled: checkUserRoleAllowMultiple(currentUser!, [ROLE_CODE.ASSISTANT, ROLE_CODE.HP_ASSISTANT]),
    queryKey: ["ma-hoc-phan", currentUser] as const,
    queryFn: ({ queryKey }) => {
      const [, currentUser] = queryKey;
      if (checkUserRoleAllow(currentUser!, ROLE_CODE.ASSISTANT)) return maHocPhanApi.list().then((res) => res.data);
      return hocPhanChuongApi.list().then((res) => res.data);
    }
  });
  const ma_hp = Form.useWatch(["ma_hoc_phan"], form);
  const { data: dataChuong, isLoading: loadingChuong } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    enabled: !!ma_hp && checkUserRoleAllowMultiple(currentUser!, [ROLE_CODE.ASSISTANT, ROLE_CODE.HP_ASSISTANT]),
    queryKey: ["ma-hoc-phan", ma_hp],
    queryFn: ({ queryKey }) => {
      const [_, ma_hp] = queryKey;
      return cauHoiApi.listChuong(ma_hp).then((res) => res.data);
    }
  });
  const onFinish = async (values: any) => {
    handlePromise(
      () => {
        return hocPhanChuongApi.createChuDeForCauHoi(cauHoi.id, values);
      },
      {
        setLoading,
        callWhenSuccess: async () => {
          api.success({
            message: t("message.success_add"),
            description: t("message.success_desc_add")
          });
          onReset && onReset();
          onCancel();
        }
      }
    );
  };
  return (
    <Modal centered open={open} onCancel={onCancel} footer={<></>}>
      <DialogContainerForm
        titleText="Thêm chủ đề vào câu hỏi"
        onCancel={onCancel}
        onFinish={onFinish}
        loading={loading}
        form={form}
      >
        <Form.Item
          key="ma_hoc_phan"
          label="Mã học phần"
          name={["ma_hoc_phan"]}
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
          ></Select>
        </Form.Item>

        <Form.Item
          label="Chủ đề"
          key="chuong_id"
          name={["chuong_id"]}
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
          label="Độ khó"
          key="do_kho"
          name={["do_kho"]}
          rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}
        >
          <Select options={listDoKho}></Select>
        </Form.Item>
      </DialogContainerForm>
    </Modal>
  );
};
