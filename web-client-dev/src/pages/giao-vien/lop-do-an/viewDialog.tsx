import { FC, ReactNode, useState } from "react";
import { Descriptions, DescriptionsProps, Modal, notification } from "antd";

import { SiMicrosoftexcel } from "react-icons/si";
import ColorButton from "@/components/Button";

interface Props {
  openModal: boolean;
  closeModal: (value: boolean) => void;
  translation: string;
  title: string;
  optionsView: any;
  icon?: ReactNode;
  apiConfirm: any;
  id: string | number;
  setKeyRender?: (value: number) => void;
  backAgree?: boolean;
}
const ViewDialog: FC<Props> = (props) => {
  const { openModal, closeModal, title, optionsView, icon, apiConfirm, id, setKeyRender, backAgree } = props;
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const cancel = () => {
    closeModal(false);
  };
  const items: DescriptionsProps["items"] = [...optionsView];

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
          {backAgree && (
            <div className="flex justify-end gap-2 pt-4 ">
              <ColorButton onClick={handleReject} loading={loading}>
                Từ chối
              </ColorButton>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ViewDialog;
