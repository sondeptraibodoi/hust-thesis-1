import { Laravel400ErrorResponse, LaravelValidationResponse } from "@/interface/axios/laravel";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  TimePicker,
  Upload,
  UploadFile,
  UploadProps,
  notification
} from "antd";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { dealsWith } from "@/api/axios/error-handle";
import { UploadOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { SiMicrosoftexcel } from "react-icons/si";
import ColorButton from "../Button";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
interface ChildrenOption {
  value: string | number;
  title: string;
  label?: string;
}
export interface Option {
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
    | "upload"
    | string;
  name: string;
  password?: boolean;
  children?: ChildrenOption[];
  label: string;
  subTitle?: string;
  rule?: object[];
  mode?: "multiple" | "tags";
  timeFomat?: string;
  initialValue?: any | null;
  placeholder?: string;
  defaultValue?: object[] | string;
  uploadfileType?: string;
  min?: number;
  disabled?: boolean;
  readOnly?: boolean;
  propInput?: any;
}
interface Props {
  openModal: boolean;
  data?: any;
  closeModal: (value: boolean) => void;
  isEdit: boolean;
  setIsEdit?: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  options: Option[];
  apiCreate: any;
  apiEdit?: any;
  icon?: ReactNode;
  createIdLop?: string | number;
  readOnly?: boolean;
  disableSubTitle?: boolean;
  isFillData?: boolean;
}
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const CreateNEditDialog: FC<Props> = (props) => {
  const {
    openModal,
    closeModal,
    data,
    isEdit,
    setIsEdit,
    setKeyRender,
    options,
    apiCreate,
    apiEdit,
    icon,
    createIdLop,
    isFillData
  } = props;
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | undefined>();
  const handleError = useCallback((err: any) => {
    return dealsWith({
      "422": (e: any) => {
        const error = e as AxiosError<LaravelValidationResponse>;
        if (error.response) setErrorMessage(error.response.data);
      },
      "400": (e: any) => {
        const error = e as AxiosError<Laravel400ErrorResponse>;
        if (error.response) {
          api.error({
            message: "Thất bại",
            description: error.response.data.message
          });
        }
      }
    })(err);
  }, []);
  const onFinish = async (values: { [index: string]: any }) => {
    setLoading(true);
    try {
      options.forEach((option) => {
        const temp = option as any;
        const key = temp.name;
        if (temp.type === "date" && values[key]) {
          if (dayjs.isDayjs(values[key])) {
            values[key] = values[key].format("YYYY-MM-DD");
          } else {
            values[key] = dayjs(values[key]).format("YYYY-MM-DD");
          }
        }
      });
      if (values.file != null && values.file != undefined && values.file instanceof Object) {
        if (values.file.fileList.length > 0) {
          values.file = values.file.fileList[0].originFileObj;
        }
      }
    } catch (err) {
      console.error(err);
    }
    if (isEdit) {
      try {
        await apiEdit({ ...data, ...values });
        api.success({
          message: "Thành công",
          description: "Sửa thành công"
        });
        cancel();
        form.resetFields();
        setIsEdit && setIsEdit(false);
        setKeyRender(Math.random());
      } catch (err: any) {
        const is_handle = handleError(err);
        if (!is_handle) {
          api.error({
            message: "Thất bại",
            description: err.message.errors || "Sửa mới thất bại"
          });
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        if (createIdLop) {
          await apiCreate({ lop_id: createIdLop, ...values });
        } else {
          await apiCreate(values);
        }
        api.success({
          message: "Thành công",
          description: "Thêm mới thành công"
        });
        cancel();
        form.resetFields();
        setKeyRender(Math.random());
      } catch (err: any) {
        const is_handle = handleError(err);
        if (!is_handle) {
          api.error({
            message: "Thất bại",
            description: "tạo mới thất bại"
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };
  const handleChange = (option: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (option.name && updatedErrors[option.name]) {
        updatedErrors[option.name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };
  const validateForm = (option: any) => {
    if (errorMessage && errorMessage.errors?.[option.name]?.length) {
      return "error";
    } else {
      return "success";
    }
  };
  const cancel = () => {
    setFileList([]);
    closeModal(false);
    setIsEdit && setIsEdit(false);
    form.resetFields();
    setErrorMessage(undefined);
  };
  useEffect(() => {
    if ((isEdit && data) || isFillData) {
      form.setFieldsValue(data);
    }
  }, [isEdit, data, form]);

  const uploadprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList
  };

  const renderOption = (value: Option) => {
    if (value.type.toLowerCase() === "input") {
      return value.password ? (
        <Input.Password
          disabled={value.disabled}
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
          readOnly={value.readOnly}
        />
      ) : (
        <Input
          disabled={value.disabled}
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
          readOnly={value.readOnly}
        />
      );
    } else if (value.type.toLowerCase() === "inputnumber") {
      return (
        <InputNumber
          disabled={value.disabled}
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
          className="w-full"
          min={value.min}
          readOnly={value.readOnly}
          {...value.propInput}
        />
      );
    } else if (value.type.toLocaleLowerCase() === "select") {
      return (
        <Select
          disabled={value.disabled}
          placeholder={value.placeholder}
          allowClear
          showSearch
          defaultValue={value.defaultValue}
          mode={value.mode}
          optionFilterProp="children"
          filterSort={(optionA, optionB) =>
            (optionA?.value ?? "")
              .toString()
              .toLowerCase()
              .localeCompare((optionB?.value ?? "").toString().toLowerCase())
          }
        >
          {value.children?.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.title}
            </Option>
          ))}
        </Select>
      );
    } else if (value.type.toLowerCase() === "textarea") {
      return <TextArea disabled={value.disabled} placeholder={value.placeholder} readOnly={value.readOnly} />;
    } else if (value.type.toLowerCase() === "switch") {
      return <Switch defaultChecked={value.initialValue ? value.initialValue : false} disabled={value.disabled} />;
    } else if (value.type.toLowerCase() === "checkbox") {
      return <Checkbox disabled={value.disabled}>{value.subTitle}</Checkbox>;
    } else if (value.type.toLowerCase() === "timepicker") {
      return (
        <TimePicker
          disabled={value.disabled}
          placeholder={value.placeholder}
          format={value.timeFomat}
          onChange={() => handleChange(value)}
        />
      );
    } else if (value.type.toLowerCase() === "timerange") {
      return <TimePicker.RangePicker disabled={value.disabled} onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "datepicker") {
      return (
        <DatePicker
          disabled={value.disabled}
          placeholder={value.placeholder}
          format={value.timeFomat}
          onChange={() => handleChange(value)}
          className="w-full"
          {...value.propInput}
        />
      );
    } else if (value.type.toLowerCase() === "date") {
      return (
        <DatePicker
          disabled={value.disabled}
          style={{ width: "100%" }}
          placeholder={value.placeholder}
          format={(date) => date.format(value.timeFomat)}
          onChange={() => handleChange(value)}
          {...value.propInput}
        />
      );
    } else if (value.type.toLowerCase() === "autocomplete") {
      return (
        <Select
          disabled={value.disabled}
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
      return <RangePicker disabled={value.disabled} format={value.timeFomat} onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "password") {
      return (
        <Input.Password
          disabled={value.disabled}
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
          readOnly={value.readOnly}
        />
      );
    } else if (value.type.toLowerCase() === "upload") {
      return (
        <Upload disabled={value.disabled} {...uploadprops} accept={value.uploadfileType} style={{ width: "100%" }}>
          <Button block icon={<UploadOutlined />}>
            Chọn tệp tin
          </Button>
        </Upload>
      );
    } else {
      return (
        <Input
          disabled={value.disabled}
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
          readOnly={value.readOnly}
        />
      );
    }
  };
  return (
    <>
      {contextHolder}
      <Modal open={openModal} centered onCancel={cancel} footer={<></>} width={570}>
        <div className="model-container">
          <div className="model-icon create-icon">
            <div>{icon ? icon : <SiMicrosoftexcel />}</div>
          </div>

          <div className="">
            <Title level={4}>{isEdit ? "Sửa" : 'Tạo mới'}</Title>
          </div>
          <div className="scrollable-content">
            <Form className="base-form flex-grow-1 overflow-y-auto" form={form} layout="vertical" onFinish={onFinish}>
              {options.map((option: any, index: number) => (
                <Form.Item
                  label={option.label}
                  name={option.name ? option.name : undefined}
                  rules={option.rule}
                  key={index}
                  initialValue={option.initialValue}
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
              <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
                <div className="flex justify-between gap-4">
                  <ColorButton block onClick={cancel}>
                    Đóng
                  </ColorButton>
                  <ColorButton block htmlType="submit" loading={loading} type="primary">
                    Ghi
                  </ColorButton>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreateNEditDialog;
