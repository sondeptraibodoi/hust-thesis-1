import ColorButton from "@/components/Button";
import { List, Modal, notification } from "antd";
import { FC, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./cau-hoi.css";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { DoKhoCellRender } from "@/components/TrangThaiCellRender";
interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  translation: string;
  icon?: ReactElement;
  data: any;
  api: any;
  route?: string;
  title?: string;
}
const DuyetDoKhoDialog: FC<Props> = ({ show, setShow, translation, data, setKeyRender, api, title }) => {
  const { t } = useTranslation(translation);
  const [apiResult, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingTuChoi, setLoadingTuChoi] = useState(false);
  loadingTuChoi;
  const [items, setItems] = useState([]);

  const onFinish = async (yeuCau: any) => {
    if (!data) {
      return;
    }
    yeuCau == "phe_duyet" ? setLoading(true) : setLoadingTuChoi(true);
    try {
      await api({ ...data, yeuCau: yeuCau });
      apiResult.success({
        message: t("message.success_accept_difficulty"),
        description:
          yeuCau == "phe_duyet"
            ? t("message.success_desc_accept_difficulty")
            : t("message.success_desc_tuchoi_difficulty")
      });
      setShow(false);
      setKeyRender(Math.random());
    } catch (err: any) {
      apiResult.error({
        message: t("message.error_accept_difficulty"),
        description: err.response?.data?.message
          ? err.response?.data?.message
          : t("message.error_desc_accept_difficulty")
      });
    } finally {
      yeuCau == "phe_duyet" ? setLoading(false) : setLoadingTuChoi(false);
    }
  };
  const handleCancel = () => {
    setShow(false);
  };

  useEffect(() => {
    const item = data?.chuongs?.map((x: any) => {
      return {
        ma_hoc_phan: x?.ma_hoc_phan,
        chuong: x?.chuong.ten,
        do_kho: x?.do_kho
      };
    });
    setItems(item);
  }, [data]);

  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={show} onCancel={() => handleCancel()} width={570}>
        <div className="delete-icon">
          <div>
            <ExclamationCircleFilled />
          </div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">{title}</p>
          <List
            className="overflow-y-auto"
            style={{ maxHeight: "500px" }}
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item: any, index) => (
              <List.Item>
                <div style={{ display: "flex", width: "100%" }}>
                  <div style={{ flex: "0 0 50px" }}>
                    <p>{index + 1}</p>
                  </div>
                  <div style={{ flex: "0 0 100px" }}>
                    <p>{item.ma_hoc_phan}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p>{item.chuong}</p>
                  </div>
                  <div style={{ flex: "0 0 50px" }}>{DoKhoCellRender({ data: item.do_kho })}</div>
                </div>
              </List.Item>
            )}
          />
        </div>
        <div className="flex justify-between gap-2 pt-4">
          <ColorButton block onClick={handleCancel}>
            {t("action.cancel")}
          </ColorButton>
          <ColorButton block onClick={() => onFinish("phe_duyet")} loading={loading} type="primary">
            {t("action.accept")}
          </ColorButton>
          <ColorButton
            block
            onClick={() => onFinish("tu_choi")}
            loading={loadingTuChoi}
            style={{ borderColor: "red", backgroundColor: "#c02135", color: "white" }}
          >
            {t("action.tu_choi")}
          </ColorButton>
        </div>
      </Modal>
    </>
  );
};

export default DuyetDoKhoDialog;
