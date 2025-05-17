import { convertErrorAxios } from "@/api/axios";
import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import ColorButton from "@/components/Button";
import MathDisplay from "@/components/MathDisplay";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Modal, Space, Typography, notification } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { FC, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";

interface Props {
  openModal: boolean;
  icon?: ReactNode;
  isEdit: boolean;
  setEdit: (value: boolean) => void;
  closeModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  maHocPhan: string | undefined;
  selectedChuong: string | null;
  dataEdit: any;
  isFormAddQuestion: boolean;
}

const { Title } = Typography;

const ModalCauHoiChuong: FC<Props> = ({
  openModal,
  icon,
  isEdit,
  setEdit,
  closeModal,
  setKeyRender,
  maHocPhan,
  selectedChuong,
  dataEdit,
  isFormAddQuestion
}) => {
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);

  const [answers, setAnswers] = useState([
    { id: "uuid1", content: "", checked: false },
    { id: "uuid2", content: "", checked: false },
    { id: "uuid3", content: "", checked: false },
    { id: "uuid4", content: "", checked: false }
  ]);

  const [nextId, setNextId] = useState(5);
  const [content, setContent] = useState("");

  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setContent(newValue);
    form.setFieldsValue({ noi_dung: newValue });
  };

  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
  };

  const handleCancel = () => {
    closeModal(false);
    setEdit(false);
    setErrorMessage(null);
    form.resetFields();
    setAnswers([
      { id: "uuid1", content: "", checked: false },
      { id: "uuid2", content: "", checked: false },
      { id: "uuid3", content: "", checked: false },
      { id: "uuid4", content: "", checked: false }
    ]);
    setContent("");
  };

  const addAnswer = () => {
    setAnswers([...answers, { id: `uuid${nextId}`, content: "", checked: false }]);
    setNextId(nextId + 1);
  };

  const removeAnswer = (id: string) => {
    setAnswers(answers.filter((answer) => answer.id !== id));
  };

  const handleContentChange = (id: string, content: string) => {
    setAnswers(answers.map((answer) => (answer.id === id ? { ...answer, content } : answer)));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setAnswers(answers.map((answer) => (answer.id === id ? { ...answer, checked } : answer)));
  };

  useEffect(() => {
    if (isEdit && dataEdit) {
      form.setFieldsValue({
        noi_dung: dataEdit.noi_dung,
        ...dataEdit
      });
      const updatedAnswers = dataEdit.lua_chon.map((choice: any) => ({
        id: choice.id,
        content: choice.content,
        checked: choice.correct
      }));
      setAnswers(updatedAnswers);
    }
  }, [form, dataEdit, isEdit]);

  const onFinish = async (values: any) => {
    const luaChon = answers.map((answer) => ({
      id: answer.id,
      content: answer.content
    }));

    const dapAn = answers.filter((answer) => answer.checked).map((answer) => answer.id);
    const loai = dapAn.length === 1 ? "single" : "multi";

    const data = {
      noi_dung: values.noi_dung,
      lua_chon: luaChon,
      dap_an: dapAn,
      loai,
      ma_hoc_phan: maHocPhan,
      chuong_id: Number(selectedChuong)
    };
    setLoading(true);
    if (isEdit) {
      try {
        await hocPhanChuongApi.updateCauHoi({ ...dataEdit, ...data });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        closeModal(false);
        form.resetFields();
        setAnswers([
          { id: "uuid1", content: "", checked: false },
          { id: "uuid2", content: "", checked: false },
          { id: "uuid3", content: "", checked: false },
          { id: "uuid4", content: "", checked: false }
        ]);
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
        await hocPhanChuongApi.createCauHoi(data);
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        closeModal(false);
        form.resetFields();
        setAnswers([
          { id: "uuid1", content: "", checked: false },
          { id: "uuid2", content: "", checked: false },
          { id: "uuid3", content: "", checked: false },
          { id: "uuid4", content: "", checked: false }
        ]);
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

  const onFinishRaw = async (values: any) => {
    const noiDungRaw = values.noi_dung_raw;
    const multiMatch = noiDungRaw.match(/\\begin\{multi\}(.*?)\\end\{multi\}/s);

    if (multiMatch) {
      const multiContent = multiMatch[1];
      const questionMatch = multiContent.match(/\n(.*?)(?=\\item)/s);
      const itemsMatch = multiContent
        .split(/(?:^|\n)\s*(\\item\*?|\s*\\item\[fraction=-100\]|\s*\\item)/)
        .slice(1)
        .map((item: any) => item.replace(/\[fraction=-100\]/g, ""));

      if (questionMatch && itemsMatch) {
        const question = questionMatch[1].trim();

        const answers = itemsMatch.reduce((acc: any[], item: any, index: any, array: any) => {
          if (item.startsWith("\\item") || item.startsWith("\\item*") || item.startsWith("\\item[fraction=-100]")) {
            const isCorrect = item.startsWith("\\item*");
            const answerContent = array[index + 1] ? array[index + 1].trim() : "";
            acc.push({
              id: `uuid${index / 2 + 1}`,
              content: answerContent,
              checked: isCorrect
            });
          }
          return acc;
        }, []);

        const luaChon = answers.map((answer: any) => ({
          id: answer.id,
          content: answer.content
        }));

        const dapAn = answers.filter((answer: any) => answer.checked).map((answer: any) => answer.id);

        const loai = dapAn.length === 1 ? "single" : "multi";

        const data = {
          noi_dung: question,
          lua_chon: luaChon,
          dap_an: dapAn,
          loai,
          ma_hoc_phan: maHocPhan,
          chuong_id: Number(selectedChuong)
        };

        setLoading(true);
        setContent("");

        if (isEdit) {
          try {
            await hocPhanChuongApi.updateCauHoi({ ...dataEdit, ...data });
            api.success({
              message: t("message.success_edit"),
              description: t("message.success_desc_edit")
            });
            closeModal(false);
            form.resetFields();
            setAnswers([
              { id: "uuid1", content: "", checked: false },
              { id: "uuid2", content: "", checked: false },
              { id: "uuid3", content: "", checked: false },
              { id: "uuid4", content: "", checked: false }
            ]);
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
            await hocPhanChuongApi.createCauHoi(data);
            api.success({
              message: t("message.success_add"),
              description: t("message.success_desc_add")
            });
            closeModal(false);
            form.resetFields();
            setAnswers([
              { id: "uuid1", content: "", checked: false },
              { id: "uuid2", content: "", checked: false },
              { id: "uuid3", content: "", checked: false },
              { id: "uuid4", content: "", checked: false }
            ]);
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
      }
    }
  };

  return (
    <>
      {contextHolder}
      {isFormAddQuestion || isEdit ? (
        <Modal open={openModal} onCancel={handleCancel} footer={<></>} width={800}>
          <div className="model-container">
            <div className="model-icon create-icon">
              <div>{icon ? icon : <SiMicrosoftexcel />}</div>
            </div>

            <div className="">
              <Title level={4}>{isEdit ? t("title.edit") : t("title.create_new")}</Title>

              <p>{isEdit ? t("sub_title.edit") : t("sub_title.create_new")}</p>
            </div>

            <Form className="base-form flex-grow-1" form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item label={t("field.noi_dung")} name="noi_dung" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Nhập tiêu đề câu hỏi" />
              </Form.Item>

              <Title level={5}>{t("field.lua_chon")}</Title>
              {answers.map((answer, index) => (
                <Form.Item
                  key={answer.id}
                  label={`Đáp án ${index + 1}`}
                  name={["lua_chon", index]}
                  rules={[{ required: true }]}
                  validateStatus={validateForm(errorMessage?.errors?.dap_an?.length)}
                  help={errorMessage?.errors?.dap_an ? "Chọn ít nhất 1 đáp án đúng" : undefined}
                >
                  <Space.Compact block>
                    <div style={{ width: "10%" }}>
                      <Checkbox
                        name="dap_an"
                        value={answer.id}
                        checked={answer.checked}
                        onChange={(e) => handleCheckboxChange(answer.id, e.target.checked)}
                      />
                    </div>
                    <TextArea
                      rows={2}
                      style={{ width: "80%" }}
                      value={answer.content}
                      placeholder="Nhập nội dung đáp án"
                      onChange={(e) => handleContentChange(answer.id, e.target.value)}
                    />
                    <Button type="link" danger icon={<MinusCircleOutlined />} onClick={() => removeAnswer(answer.id)} />
                  </Space.Compact>
                </Form.Item>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={addAnswer} style={{ width: "100%" }}>
                  <PlusOutlined /> Thêm Câu Trả Lời
                </Button>
              </Form.Item>
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
          </div>
        </Modal>
      ) : (
        <Modal open={openModal} onCancel={handleCancel} footer={<></>} width={800}>
          <div className="model-container">
            <div className="model-icon create-icon">
              <div>{icon ? icon : <SiMicrosoftexcel />}</div>
            </div>

            <div className="">
              <Title level={4}>{isEdit ? t("title.edit") : t("title.create_new")}</Title>

              <p>{isEdit ? t("sub_title.edit") : t("sub_title.create_new")}</p>
            </div>

            <Form className="base-form flex-grow-1" form={form} layout="vertical" onFinish={onFinishRaw}>
              <Form.Item label={t("field.noi_dung")} name="noi_dung_raw" rules={[{ required: true }]}>
                <TextArea rows={10} placeholder="Soạn câu hỏi" onChange={handleChange} value={content} />
              </Form.Item>
              <Form.Item>
                <div className="relative mt-4" style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
                  <div className="mx-3 absolute bg-white -top-3.5">
                    <h3>Xem trước</h3>
                  </div>
                  <div className="p-5">
                    <MathDisplay mathString={content} />
                  </div>
                </div>
              </Form.Item>

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
          </div>
        </Modal>
      )}
    </>
  );
};

export default ModalCauHoiChuong;
