import { FC, PropsWithChildren, ReactNode, memo } from "react";
import { Form, FormInstance, Typography } from "antd";

import ColorButton from "../Button";
import { FormProps } from "antd/lib";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title } = Typography;
const DialogContainerForm: FC<
  PropsWithChildren & {
    icon?: ReactNode;
    titleText: string;
    textButtonCancel?: string;
    textButtonSubmit?: string;
    propsButtonSubmit?: any;
    onCancel: () => void;
    loading?: boolean;
    onFinish: (data: any) => any;
    form?: FormInstance;
    propForm?: FormProps;
    noFooter?: boolean;
  }
> = memo(
  ({
    icon,
    titleText,
    children,
    onCancel,
    loading,
    onFinish,
    textButtonCancel,
    textButtonSubmit,
    form,
    propsButtonSubmit,
    propForm,
    noFooter
  }) => {
    const { t } = useTranslation("common");
    return (
      <div className="model-container">
        <div className="model-icon create-icon">
          <div>{icon ? icon : <PlusOutlined />}</div>
        </div>
        <div className="">
          <Title level={4}>{titleText}</Title>
        </div>

        <div className="scrollable-content">
          <Form
            className="base-form flex-grow-1 overflow-y-auto"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            {...propForm}
          >
            {children}
            {!noFooter && (
              <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
                <div className="flex justify-between gap-4">
                  <ColorButton block onClick={onCancel}>
                    {textButtonCancel || t("action.cancel")}
                  </ColorButton>
                  <ColorButton block htmlType="submit" loading={loading} type="primary" {...propsButtonSubmit}>
                    {textButtonSubmit || t("action.accept")}
                  </ColorButton>
                </div>
              </Form.Item>
            )}
          </Form>
        </div>
      </div>
    );
  }
);
export { DialogContainerForm };
export default DialogContainerForm;
