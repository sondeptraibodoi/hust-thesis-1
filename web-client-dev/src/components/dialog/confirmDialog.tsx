import { FC, ReactNode, useState } from "react";
import { Descriptions, DescriptionsProps, Modal, notification } from "antd";

import ColorButton from "../Button";

import { SiMicrosoftexcel } from "react-icons/si";

interface Props {
  data: any;
  openModal: boolean;
  name: string | undefined;
  closeModal: (value: boolean) => void;
  setKeyRender?: (value: number) => void;
  apiConfirm: any;
  translation: string;
  renderAgain?: any;
  id: string | number;
  title: string;
  options: any;
  icon?: ReactNode;
}
const ConfirmDialog: FC<Props> = (props) => {
  const { openModal, closeModal, setKeyRender, renderAgain, id, apiConfirm, title, options, icon } = props;
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const cancel = () => {
    closeModal(false);
  };
  const handleOk = async () => {
    setLoading(true);
    try {
      await apiConfirm({
        trang_thai: "1-duyet",
        id: id
      });
      api.success({
        message: "Thành công",
        description: "Phê duyệt phiếu thực tập thành công"
      });
      renderAgain(Math.random());
    } catch (error: any) {
      api.error({
        message: "Thất bại",
        description: error.response.data.message ? error.response.data.message : "Phê duyệt không thành công"
      });
    } finally {
      setKeyRender && setKeyRender(Math.random());
      setLoading(false);
      closeModal(false);
    }
  };
  const handleReject = async () => {
    setLoading(true);
    try {
      await apiConfirm({
        trang_thai: "2-tu-choi",
        id: id
      });
      api.success({
        message: "Thành công",
        description: "Đã từ chối phiếu thực tập"
      });
      renderAgain(Math.random());
    } catch (error: any) {
      api.error({
        message: "Thất bại",
        description: error.response.data.message ? error.response.data.message : "Từ chối phiếu không thành công"
      });
    } finally {
      setKeyRender && setKeyRender(Math.random());
      setLoading(false);
      closeModal(false);
    }
  };
  const items: DescriptionsProps["items"] = [...options];

  return (
    <>
      {contextHolder}
      <Modal centered open={openModal} onCancel={cancel} footer={<></>} width={570}>
        <div className="model-icon create-icon">
          <div>{icon ? icon : <SiMicrosoftexcel />}</div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">{title}</p>
          <p className="modal-suptitle mt-4">
            <Descriptions column={1}>
              {items.map((item, index) => (
                <Descriptions.Item
                  key={index}
                  label={item.label}
                  labelStyle={{ color: "black" }}
                  contentStyle={{ fontWeight: "700" }}
                >
                  {item.children}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </p>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <ColorButton block onClick={handleReject}>
            Từ chối
          </ColorButton>
          <ColorButton block onClick={handleOk} loading={loading} type="primary">
            Phê duyệt
          </ColorButton>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmDialog;
