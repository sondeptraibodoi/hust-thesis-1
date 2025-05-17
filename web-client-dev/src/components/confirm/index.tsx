import { Button, Modal, Space, Typography } from "antd";
import { ReactElement, Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";

import { EDIT_TYPE, EDIT_TYPE_TYPE } from "@/constant";
import { DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
interface Props {
  title: string | ReactElement;
  text: string | ReactElement;
  icon?: ReactElement;
  noText?: string;
  yesText?: string;
  type?: EDIT_TYPE_TYPE;
  color?: any;
  classNameIcon?: string;
  click?: () => void;
  handleAfterClick?: (error?: any) => void;
}
export interface ConfirmHandle {
  open: (_: Props) => Promise<boolean>;
}

const DEFAULT_PROP: { [key in EDIT_TYPE_TYPE]?: any } = {
  [EDIT_TYPE.DELETE]: {
    icon: <DeleteOutlined />,
    color: "#FF5A5A",
    yesText: "Xoá",
    classNameIcon: "delete-icon"
  }
};
const { Title, Text } = Typography;
export const ConfirmDialog = forwardRef<ConfirmHandle>((_: unknown, ref: Ref<ConfirmHandle>) => {
  const { t } = useTranslation("default");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const promise = useRef<{ resolve: any; reject: any }>({
    resolve: null,
    reject: null
  });
  const [option, setOption] = useState<Partial<Props>>({
    title: "",
    text: "",
    color: "#0747A6"
  });
  useImperativeHandle(ref, () => ({
    open
  }));
  function open(options: Props) {
    setLoading(false);
    let temp: Partial<Props> = {};
    if (options.type) {
      temp = DEFAULT_PROP[options.type] || {};
    }
    temp = Object.assign({ icon: <DeleteOutlined />, color: "#0747A6" }, temp, options);
    setOption(temp);
    setShow(true);

    return new Promise<any>((resolve, reject) => {
      promise.current = {
        resolve,
        reject
      };
    });
  }
  function close() {
    setShow(false);
    promise.current = {
      resolve: null,
      reject: null
    };
  }
  async function agree() {
    if (promise.current && promise.current.resolve) {
      if (option.click) {
        try {
          setLoading(true);
          await option.click();
          if (option.handleAfterClick) {
            await option.handleAfterClick();
          }
        } catch (error) {
          if (option.handleAfterClick) {
            await option.handleAfterClick(error);
          }
        } finally {
          setLoading(false);
        }
      }
      promise.current.resolve(true);
    }
    close();
  }
  function cancel() {
    if (promise.current && promise.current.resolve) promise.current.resolve(false);
    close();
  }
  return (
    <Modal open={show} closeIcon={null} footer={null} width={400} centered>
      <Space direction="vertical" className="w-full">
        <Space.Compact direction="vertical">
          <Title level={5}>{option.title}</Title>
          <Text className="whitespace-pre-line">{option.text}</Text>
        </Space.Compact>
        <Space.Compact block className="flex justify-end gap-2 pt-4">
          <Button
            onClick={agree}
            block
            style={{
              background: option.color,
              borderColor: "unset",
              color: "#ffff"
            }}
            loading={loading}
          >
            {option.yesText || t("actions.apply", "Xác nhận")}
          </Button>
          <Button onClick={cancel} block disabled={loading}>
            {option.noText || t("actions.no", "Đóng")}
          </Button>
        </Space.Compact>
      </Space>
    </Modal>
  );
});

export default ConfirmDialog;
