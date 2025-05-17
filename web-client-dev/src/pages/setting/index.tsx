import { DeleteOutlined } from "@ant-design/icons";
import { Col, Result, Row, Typography, notification } from "antd";
import { FC, useEffect, useState } from "react";

import { sdk } from "@/api/axios";
import configApi from "@/api/config.api";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import ColorButton from "@/components/Button";
import { setHeightAuto } from "@/stores/features/config";
import { useAppDispatch } from "@/stores/hook";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import ConfigHust from "./config-hust";
import { BaoCaoSetting } from "./part/bao-cao";
import { DiemDanhSetting } from "./part/diem-danh";

const { Title } = Typography;
const Setting: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(["setting", "setting-bao-cao"]);
  const [setting, setSetting] = useState({});
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [kiHoc, setKihoc] = useState<{ label: string; value: string }[]>([]);
  const [healthStatus, setHealthStatus] = useState("");
  const [healthMessage, setHealthMessage] = useState("");

  useEffect(() => {
    dispatch(setHeightAuto(true));
    return () => {
      dispatch(setHeightAuto(false));
    };
  });
  useEffect(() => {
    const getKihoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data.map((x: any) => ({ value: x, label: x })));
      }
    };
    getKihoc();
  }, []);
  useEffect(() => {
    configApi.getSetting().then((res) => {
      setSetting(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await sdk.get("/health-check");
        const data = response.data;
        setHealthStatus(data.status);
        setHealthMessage(data.message);
      } catch (error) {
        console.error("Server lỗi:", error);
      }
    };

    fetchHealthStatus();
  }, []);

  const clearCacheAndCheckHealth = async () => {
    try {
      const response = await sdk.get("/health-check-review");
      const data = response.data;
      setHealthStatus(data.status);
      api.success({
        message: t("message.success"),
        description: data.message
      });
    } catch (error) {
      console.error("Server lỗi:", error);
    }
  };

  const deleteCache = async () => {
    setLoading(true);
    try {
      await sdk.get("/cache/clear");
      Object.keys(localStorage)
        .filter((x) => x.startsWith("i18next_res_"))
        .forEach((x) => localStorage.removeItem(x));
      api.success({
        message: t("message.success"),
        description: t("message.success_desc")
      });
    } catch (error) {
      api.error({
        message: t("message.error"),
        description: t("message.error_desc")
      });
    } finally {
      setLoading(false);
    }
  };
  const isMobile = useMediaQuery({ minWidth: 600 });

  return (
    <>
      {contextHolder}
      <Row className={isMobile ? "p-2" : "p-2 flex flex-col"}>
        <Col span={24}>
          {/* Xoa cache */}
          <Col span={24}>
            <Title level={3}>{t("title.cong_cu")}</Title>
            <ColorButton type="primary" loading={loading} onClick={deleteCache} icon={<DeleteOutlined />}>
              {t("sub_title.delete_cache")}
            </ColorButton>
          </Col>
        </Col>
        <Col span={12}>
          <Title level={3}>Máy chủ nhận diện</Title>
          {healthStatus === "ok" ? (
            <Result
              status="success"
              title={healthMessage}
              style={{ padding: "0" }}
              extra={[
                <ColorButton
                  type="primary"
                  loading={loading}
                  onClick={clearCacheAndCheckHealth}
                  icon={<DeleteOutlined />}
                  className="ms-6"
                >
                  Kiểm tra lại máy chủ
                </ColorButton>
              ]}
            />
          ) : (
            <Result
              status="warning"
              title="Server lỗi"
              style={{ padding: "0" }}
              extra={[
                <ColorButton
                  type="primary"
                  loading={loading}
                  onClick={clearCacheAndCheckHealth}
                  icon={<DeleteOutlined />}
                  className="ms-6"
                >
                  Kiểm tra lại server và xóa cache
                </ColorButton>
              ]}
            />
          )}
        </Col>

        <Col span={24} className="mt-5">
          {/* CAI DAT KI HOC */}
          <Col span={24} className="pt-6">
            <Title level={4}>Cài đặt kì học</Title>
            <ConfigHust setting={setting}></ConfigHust>
          </Col>
        </Col>
        {/* Cai dat Bao Cao */}
        <Col span={isMobile ? 12 : 24} className="pt-6">
          <Title level={3}>Cài đặt đánh giá</Title>
          <BaoCaoSetting kiHoc={kiHoc} />
        </Col>

        {/* Cai dat diem danh */}
        <Col span={isMobile ? 12 : 24} className="pt-6">
          <Title level={3}>Cài đặt điểm danh</Title>
          <DiemDanhSetting kiHoc={kiHoc} />
        </Col>
      </Row>
    </>
  );
};

export default Setting;
