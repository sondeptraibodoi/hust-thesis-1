/* eslint-disable react-hooks/rules-of-hooks */
import { FC, ReactNode, useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  notification,
  Select,
  Switch,
  Checkbox,
  TimePicker,
  DatePicker,
  InputNumber,
  UploadFile
} from "antd";
import { SiMicrosoftexcel } from "react-icons/si";
import { useTranslation } from "react-i18next";
import ColorButton from "../Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { dealsWith } from "@/api/axios/error-handle";
import { AxiosError } from "axios";
import { Upload, UploadProps } from "antd/lib";
import { RcFile } from "antd/es/upload";
import { JsonToFormData } from "@/utils/JsonToFormData";
import sinhVienApi from "@/api/thiBu/sinhVien.api";

interface ChildrenOption {
  value: string | number;
  title: string;
  label?: string;
}
/**
 public function transferMessage(Request $request)
    {
        $request->validate([
            'ki_hoc' => 'required|string|max:255|min:0',
            'lop_id' => 'required|int',
            'lop_thi_id' => 'required|int',
            'sinh_vien_id' => 'required|int',,
            'ghi_chu' => 'string',
        ]);
        $stk = '%' . $request->ghi_chu . '%';
        $transfer = DB::table('pk_phuc_khaos')
            ->where('sinh_vien_id', '=', $request->sinh_vien_id)
            ->where('ki_hoc', '=', $request->ki_hoc)
            ->where('lop_id', '=', $request->lop_id)
            ->where('lop_thi_id', '=', $request->lop_thi_id)
            ->join('pk_sms_banks', 'pk_phuc_khaos.ma_thanh_toan', '=', 'pk_sms_banks.ma_thanh_toan')
            ->select('pk_sms_banks.tin_nhan')
            ->where('tin_nhan', 'like', $stk)
            ->get();
        return response()->json(['data' => $transfer]);
    }
 */
export interface Option {
  disabled?: boolean;
  url?: any;
  required?: boolean;
  type:
    | "input"
    | "select"
    | "textarea"
    | "inputnumber"
    | "switch"
    | "checkbox"
    | "timepicker"
    | "timerange"
    | "datepicker"
    | "daterange"
    | "autocomplete"
    | "password"
    | string;
  name: string;
  password?: boolean;
  children?: ChildrenOption[];
  label: string;
  subTitle?: string;
  rule?: object[];
  mode?: "multiple" | "tags";
  timeFomat?: string;
  placeholder?: string;
  defaultValue?: object[];
}

interface Props {
  openModal: boolean;
  data?: any;
  closeModal: (value: boolean) => void;
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  translation: string;
  options: Option[];
  apiEdit: any;
  icon?: ReactNode;
  onEditSuccess?: () => void;
  btnEdit?: string;
  apiDeleteImage?: any;
  apiAddImage?: any;
  setDataUrl?: any;
  itemSv?: any;
  setFileChange?: any;
}

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const EditDialog: FC<Props> = (props) => {
  const {
    openModal,
    closeModal,
    data,
    isEdit,
    setIsEdit,
    setKeyRender,
    translation,
    options,
    apiEdit,
    icon,
    onEditSuccess,
    btnEdit,
    apiDeleteImage,
    apiAddImage,
    setDataUrl,
    itemSv,
    setFileChange
  } = props;
  const { t } = useTranslation(translation);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | undefined>();

  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue(data);
    }
  }, [isEdit, data, form]);

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      await apiEdit({ ...data, ...values });
      api.success({
        message: t("message.success_edit"),
        description: t("message.success_desc_edit")
      });
      closeModal(false);
      form.resetFields();
      setIsEdit(false);
      setKeyRender(Math.random());
      if (onEditSuccess) onEditSuccess();
    } catch (err: any) {
      dealsWith({
        "422": (e: any) => {
          const error = e as AxiosError<LaravelValidationResponse>;
          if (error.response) setErrorMessage(error.response.data);
        }
      })(err);
      api.error({
        message: t("message.error_edit"),
        description: t("message.error_edit")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (option: Option) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (option.name && updatedErrors[option.name]) {
        updatedErrors[option.name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };

  const handleDeleteImage = async (props: any) => {
    setLoading(true);
    try {
      apiDeleteImage && (await apiDeleteImage(props.id));
      api.success({
        message: t("message.success_delete"),
        description: t("message.success_desc_delete")
      });
    } catch (error: any) {
      api.error({
        message: t("message.error_delete"),
        description: error.response.data.message ? error.response.data.message : t("message.error_desc_delete")
      });
    } finally {
      setKeyRender && setKeyRender(Math.random());
      setLoading(false);
    }
  };

  const validateForm = (option: Option) => {
    if (errorMessage && errorMessage.errors?.[option.name]?.length) {
      return "error";
    }
  };

  const cancel = () => {
    closeModal(false);
    setIsEdit(false);
    form.resetFields();
    setErrorMessage(undefined);
  };

  const renderOption = (value: Option) => {
    if (value.type.toLowerCase() === "input") {
      return value.password ? (
        <Input.Password
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
          disabled={value.disabled}
        />
      ) : (
        <Input placeholder={value.placeholder} onChange={() => handleChange(value)} disabled={value.disabled} />
      );
    } else if (value.type.toLowerCase() === "inputnumber") {
      return <InputNumber placeholder={value.placeholder} onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "select") {
      return (
        <Select
          placeholder={value.placeholder}
          allowClear={!value.required}
          mode={value.mode}
          onChange={() => handleChange(value)}
          disabled={value.disabled}
        >
          {value.children
            // ?.filter((item) => item.value !== "chua_xac_nhan")
            ?.map((item) => {
              return (
                <Option key={item.value} value={item.value} disabled={item.value == "chua_xac_nhan" ? true : false}>
                  {item.title}
                </Option>
              );
            })}
        </Select>
      );
    } else if (value.type.toLowerCase() === "textarea") {
      return <TextArea placeholder={value.placeholder} disabled={value.disabled} />;
    } else if (value.type.toLowerCase() === "switch") {
      return <Switch />;
    } else if (value.type.toLowerCase() === "checkbox") {
      return <Checkbox>{value.subTitle}</Checkbox>;
    } else if (value.type.toLowerCase() === "timepicker") {
      return (
        <TimePicker placeholder={value.placeholder} format={value.timeFomat} onChange={() => handleChange(value)} />
      );
    } else if (value.type.toLowerCase() === "timerange") {
      return <TimePicker.RangePicker onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "datepicker") {
      return (
        <DatePicker
          placeholder={value.placeholder}
          format={value.timeFomat}
          onChange={() => handleChange(value)}
          className="w-full"
        />
      );
    } else if (value.type.toLowerCase() === "autocomplete") {
      return (
        <Select
          showSearch
          placeholder={value.placeholder}
          allowClear
          filterOption={(input, option: any) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          mode={value.mode}
        >
          {value.children?.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.title}
            </Option>
          ))}
        </Select>
      );
    } else if (value.type.toLowerCase() === "daterange") {
      return <RangePicker format={value.timeFomat} onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "password") {
      return <Input.Password placeholder={value.placeholder} onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "dragger") {
      const initImage = (listurl: any) => {
        const newArray = listurl?.map((item: any) => {
          return {
            id: item.id,
            uid: item.id,
            name: item.name,
            status: "done",
            url: item.url
          };
        });
        return newArray || [];
      };
      const [fileList, setFileList] = useState<UploadFile[]>(initImage(value.url ? value.url : []));

      useEffect(() => {
        setFileList(initImage(value.url));
      }, [value.url]);

      const onChange: UploadProps["onChange"] = async () => {
        if (itemSv) {
          const detail = await sinhVienApi.detail(itemSv);
          setDataUrl(detail.data?.image_urls);
          setFileChange(Math.random());
        }
      };

      const onPreview = async (file: UploadFile) => {
        let src = file.url as string;
        if (!src) {
          src = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file.originFileObj as RcFile);
            reader.onload = () => resolve(reader.result as string);
          });
        }
        const newWindow = window.open();
        if (file.url && file.url.endsWith("pdf")) {
          newWindow?.document.write(`<iframe src="${src}" style="width:100%;height:100%;" frameborder="0"></iframe>`);
        } else {
          const image = new Image();
          image.src = src;
          newWindow?.document.write(image.outerHTML);
        }
      };
      const customRequest = async ({ file, onSuccess, onError }: any) => {
        try {
          const res =
            apiAddImage &&
            (await apiAddImage(
              JsonToFormData({
                model_id: data.id,
                image: file
              })
            ));
          file.id = res.data.data.id;
          onSuccess(file);
        } catch (error) {
          onError(error);
        }
      };

      return (
        <>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={onPreview}
            onChange={onChange}
            disabled={value.disabled}
            customRequest={customRequest}
            onRemove={handleDeleteImage}
            multiple
          >
            {fileList.length < 22 && "+ Upload"}
          </Upload>
        </>
      );
    } else {
      return <Input placeholder={value.placeholder} onChange={() => handleChange(value)} />;
    }
  };

  return (
    <div>
      {contextHolder}
      <Modal centered open={openModal} onCancel={cancel} footer={<></>} className="relative" width={570}>
        <div className="model-container">
          <div className="create-icon">
            <div>{icon ? icon : <SiMicrosoftexcel />}</div>
          </div>

          <div className="modal-title-wapper">
            <p className="modal-title">{t("title.edit")}</p>
            <p>{t("sub_title.edit")}</p>
          </div>
          <div className="scrollable-content">
            <Form className="base-form flex-grow-1 overflow-y-auto" form={form} layout="vertical" onFinish={onFinish}>
              {options.map((option: Option, index: number) => (
                <Form.Item
                  label={option.label}
                  name={option.name ? option.name : undefined}
                  rules={option.rule ? option.rule : undefined}
                  key={index}
                  valuePropName={
                    option.type.toLowerCase() === "switch" || option.type.toLowerCase() === "checkbox"
                      ? "checked"
                      : undefined
                  }
                  validateStatus={validateForm(option)}
                  help={errorMessage?.errors?.[option.name] ? errorMessage?.errors?.[option.name][0] : undefined}
                >
                  {renderOption(option)}
                </Form.Item>
              ))}
              <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4">
                <div className="flex justify-between gap-4">
                  <ColorButton block onClick={cancel}>
                    {t("action.cancel")}
                  </ColorButton>
                  <ColorButton block htmlType="submit" loading={loading} type="primary">
                    {btnEdit ? btnEdit : t("action.accept")}
                  </ColorButton>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditDialog;
