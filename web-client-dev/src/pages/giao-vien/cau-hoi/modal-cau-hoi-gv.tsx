import { App, Checkbox, Form, Modal, Typography } from "antd";
import { FC, ReactNode, memo, useCallback, useEffect, useMemo, useState } from "react";

import { CauHoiArrayView } from "./part/cau-hoi-array-raw";
import { CauHoiForm } from "./part/cau-hoi-input";
import { CauHoiRaw } from "./part/cau-hoi-raw";
import { CauHoiRawMany } from "./part/cau-hoi-raw-many";
import { DialogContainerForm } from "@/components/dialog/dialog-container";
import { HocPhanCauHoi } from "@/interface/cauHoi";
import { MaHpTab } from "./part/cau-hoi-ma-hp-tab";
import { STATUS_QUESTION } from "@/constant";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { useTranslation } from "react-i18next";
import { CauHoiViewComplex } from "./part/cau-hoi-view-complex";

interface Props {
  openModal: boolean;
  icon?: ReactNode;
  isEdit: boolean;
  setEdit: (value: boolean) => void;
  closeModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  selectedChuong?: string | null;
  dataEdit: any;
  isFormAddQuestion: boolean;
  isFormAddManyQuestion: boolean;
  isCopy?: boolean;
  setCopy?: (value: boolean) => void;
  disableChuongs?: boolean;
  apiSubmit?: (data: any) => Promise<any>;
}

const ModalCauHoiGv: FC<Props> = memo(
  ({
    openModal,
    isEdit,
    setEdit,
    closeModal,
    setKeyRender,
    dataEdit,
    isFormAddQuestion,
    isFormAddManyQuestion,
    isCopy,
    setCopy,
    disableChuongs,
    apiSubmit
  }) => {
    const [activeKey, setActiveKey] = useState("0");
    const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [cauHoi, setCauHoi] = useState<Partial<HocPhanCauHoi> | undefined>(undefined);
    const [addAnotherQuestion, setAddAnotherQuestion] = useState(false);
    const [cauHoiArray, setCauHoiArray] = useState<Partial<HocPhanCauHoi>[] | undefined>(undefined);

    const { notification: api } = App.useApp();

    const [content, setContent] = useState("");
    const [contentArrayRaw, setContentArrayRaw] = useState("");

    const handleCancel = () => {
      closeModal(false);
      setEdit(false);
      form.resetFields();
      setContent("");
      setContentArrayRaw("");
      setCauHoi(undefined);
      setAddAnotherQuestion(false);
      setCauHoiArray(undefined);
      if (setCopy) setCopy(false);
    };

    useEffect(() => {
      if ((isEdit || isCopy) && dataEdit) {
        form.setFieldsValue({
          noi_dung: dataEdit.noi_dung,
          chuongs: dataEdit.chuongs,
          ...dataEdit,
          lua_chon: dataEdit.lua_chon.map((choice: any) => ({
            id: choice.id,
            content: choice.content,
            correct: (dataEdit.dap_an || []).includes(choice.id)
          }))
        });
        setCauHoi(dataEdit);
        setCauHoiArray(dataEdit);
      } else {
        form.setFieldsValue({
          chuongs: [{ is_primary: true, do_kho: "easy" }]
        });
      }
    }, [form, dataEdit, isEdit, isCopy]);

    const onFinish = async (data: any) => {
      const isValid = form.validateFields();

      if (!isValid) {
        api.success({
          message: "Không thõa mãn",
          description: "Dữ liệu không hợp lệ. Vui lòng điền đầy đủ tất cả các trường yêu cầu."
        });
        return;
      }
      setLoading(true);

      let success = "message.success_add";
      let success_desc = "message.success_desc_add";
      let error = "message.error_add";
      let error_desc = "message.error_desc_add";
      if (isEdit && !isCopy) {
        success = "message.success_edit";
        success_desc = "message.success_desc_edit";
        error = "message.error_edit";
        error_desc = "message.error_desc_edit";
      }
      try {
        if (apiSubmit) {
          await apiSubmit({ id: dataEdit.id, ...data });
        } else {
          if (data.cau_hois && data.cau_hois.length > 0) {
            await cauHoiApi.createCauHois(data);
          } else {
            isEdit && !isCopy
              ? await cauHoiApi.updateCauHoi({ ...dataEdit, ...data })
              : await cauHoiApi.createCauHoi(data);
          }
        }
        api.success({
          message: t(success),
          description: t(success_desc)
        });
        setKeyRender(Math.random());
        if (!addAnotherQuestion) {
          handleCancel();
        } else {
          form.setFieldsValue({
            noi_dung: "",
            lua_chon: [
              { id: "uuid1", content: "", checked: false },
              { id: "uuid2", content: "", checked: false },
              { id: "uuid3", content: "", checked: false },
              { id: "uuid4", content: "", checked: false }
            ],
            dap_an: []
          });
          setContent("");
          setContentArrayRaw("");
          setCauHoi(undefined);
          setCauHoiArray(undefined);
        }
      } catch (err: any) {
        if (err.response?.status === 422 && err.response?.data.errors?.dap_an) {
          const dapAnErrors = err.response.data.errors.dap_an;
          if (dapAnErrors.includes("Trường dap an không được bỏ trống.")) {
            api.error({
              message: t(error),
              description: "Trường đáp án không được bỏ trống."
            });
          }
        } else {
          api.error({
            message: t(error),
            description: t(error_desc)
          });
        }
      } finally {
        setLoading(false);
      }
    };
    const onValuesChange = useCallback((_: any, value: HocPhanCauHoi) => {
      value.dap_an = (value.lua_chon || []).filter((x) => x.correct).map((x) => x.id);
      value.loai = value.dap_an.length === 1 ? "single" : "multi";
      setCauHoi({ ...value });
      form.setFieldValue("dap_an", value.dap_an);
    }, []);

    const isEditingDisabled = dataEdit?.trang_thai === STATUS_QUESTION.SUA_DO_KHO;
    const titleText = useMemo(() => {
      if (isCopy) {
        return t("title.copy");
      }
      if (isEdit) {
        return t("title.edit");
      }
      return t("title.create_new");
    }, [isCopy, isEdit]);

    return (
      <Modal open={openModal} onCancel={handleCancel} footer={<></>} width={800}>
        <DialogContainerForm
          titleText={titleText}
          onCancel={handleCancel}
          onFinish={onFinish}
          loading={loading}
          propForm={{
            onValuesChange
          }}
          form={form}
          textButtonCancel={t("action.cancel")}
          textButtonSubmit={t("action.accept")}
        >
          {!disableChuongs && <MaHpTab activeKey={activeKey} setActiveKey={setActiveKey} isEditingDisabled={false} />}
          <div className="relative mt-4"></div>
          {isFormAddManyQuestion && isFormAddQuestion && !isEdit ? (
            <CauHoiRawMany
              onChange={(cauHoiArray) => setCauHoiArray(cauHoiArray)}
              contentArrayRaw={contentArrayRaw}
              setContentArrayRaw={setContentArrayRaw}
            />
          ) : !isFormAddQuestion && !isEdit && !isFormAddManyQuestion ? (
            <CauHoiRaw onChange={setCauHoi} content={content} setContent={setContent} />
          ) : (isFormAddQuestion && !isEdit) || isEdit || isCopy ? (
            <CauHoiForm isEditingDisabled={isEditingDisabled} isEdit={isEdit} />
          ) : (
            <></>
          )}

          <Form.Item>
            <div className="relative mt-4" style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
              <div className="mx-3 bg-white -top-3.5">
                <Typography.Title level={5}>Xem trước</Typography.Title>
              </div>
              <div className="p-5">
                {isFormAddManyQuestion && isFormAddQuestion && !isEdit ? (
                  <CauHoiArrayView cauHoiArray={cauHoiArray} />
                ) : (
                  cauHoi && <CauHoiViewComplex cauHoi={cauHoi as HocPhanCauHoi} />
                )}
              </div>
            </div>
          </Form.Item>

          <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
            {!isEdit && !isFormAddManyQuestion ? (
              <div className="flex justify-between items-center">
                <div className="mb-4 flex-grow">
                  <Checkbox
                    className="float-right"
                    checked={addAnotherQuestion}
                    onChange={(e) => setAddAnotherQuestion(e.target.checked)}
                  >
                    Thêm câu khác cho học phần này
                  </Checkbox>
                </div>
              </div>
            ) : (
              <></>
            )}
          </Form.Item>
        </DialogContainerForm>
      </Modal>
    );
  }
);

export default ModalCauHoiGv;
