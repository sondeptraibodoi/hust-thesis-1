import { App, Button, Form, Modal, Select, Typography } from "antd";
import { FC, useCallback, useState } from "react";
import { ImportCard } from "./import-card";
import { DownloadOutlined } from "@ant-design/icons";
import { SiMicrosoftexcel } from "react-icons/si";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useAppSelector } from "@/stores/hook";
import { getKiHienGio } from "@/stores/features/config";
import exportApi from "@/api/export/export.api";
import { useQuery } from "@tanstack/react-query";

const { Title } = Typography;
export const DownloadPard: FC = () => {
  const { notification } = App.useApp();
  const { items: ki_hocs } = useKiHoc();
  const kiHienGio = useAppSelector(getKiHienGio);
  const [downloadModal, setDownloadModel] = useState(false);
  const [typeDownload, setTypeDownload] = useState("ck");
  const [loading, setLoading] = useState(false);
  const onClickDownloadDiemKiemTraLan1 = useCallback(() => {
    setDownloadModel(true);
    setTypeDownload("kt_lan_1");
  }, []);
  const onClickDownloadDiemKiemTraLan2 = useCallback(() => {
    setDownloadModel(true);
    setTypeDownload("kt_lan_2");
  }, []);
  const onClickDownloadQT = useCallback(() => {
    setDownloadModel(true);
    setTypeDownload("qt");
  }, []);
  const onClickDownloadCK = useCallback(() => {
    setDownloadModel(true);
    setTypeDownload("ck");
  }, []);
  const [form] = Form.useForm();
  const handleCancel = () => {
    setDownloadModel(false);
    form.resetFields();
  };
  const is_dai_cuong = Form.useWatch("is_dai_cuong", form);
  const ki_hoc = Form.useWatch("ki_hoc", form);
  const { data: maHps, isLoading: loadingMaHp } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["ma-hoc-phan", is_dai_cuong, ki_hoc],
    queryFn: ({ queryKey }) => {
      const [, is_dai_cuong, ki_hoc] = queryKey;
      const params: any = { is_dai_cuong, ki_hoc };
      return exportApi.cacheMaHp(params);
    }
  });
  const onFinish = async (values: any) => {
    if (typeof values.ma_hps == "string" && values.ma_hps) {
      values.ma_hps = values.ma_hps
        .split(",")
        .filter((x: string) => !!x)
        .map((x: string) => x.trim());
    }
    try {
      setLoading(true);
      if (typeDownload === "kt_lan_1") {
        values.loai = "GK";
        await exportApi.excelAllDiem(values);
      } else if (typeDownload === "kt_lan_2") {
        values.loai = "GK2";
        await exportApi.excelAllDiem(values);
      } else if (typeDownload === "qt") {
        await exportApi.excelAllDiemQT(values);
      } else {
        await exportApi.excelAllDiemCK(values);
      }
      notification.success({
        message: "Thành công",
        description: "Tải tập tin thành công"
      });
    } catch (err) {
      notification.error({
        message: "Thất bại",
        description: "Tải tập tin thất bại"
      });
    } finally {
      setLoading(false);
    }
  };
  let textTitle = "";
  switch (typeDownload) {
    case "qt":
      textTitle = "quá trình";
      break;
    case "ck":
      textTitle = "cuối kì";
      break;
    case "kt_lan_1":
      textTitle = "lần 1";
      break;
    case "kt_lan_2":
      textTitle = "lần 2";
      break;

    default:
      break;
  }
  return (
    <>
      <Title style={{ margin: "0" }} level={2}>
        Xuất điểm thi
      </Title>
      <div className="flex flex-wrap md:flex-row">
        <div className="flex flex-wrap">
          <div className="mx-1 my-2">
            <ImportCard
              onClick={onClickDownloadDiemKiemTraLan1}
              label="Xuất điểm kiểm tra lần 1"
              icon={<DownloadOutlined style={{ fontSize: "1.7rem" }} />}
            ></ImportCard>
          </div>
          <div className="mx-1 my-2">
            <ImportCard
              onClick={onClickDownloadDiemKiemTraLan2}
              label="Xuất điểm kiểm tra lần 2"
              icon={<DownloadOutlined style={{ fontSize: "1.7rem" }} />}
            ></ImportCard>
          </div>
          <div className="mx-1 my-2">
            <ImportCard
              onClick={onClickDownloadQT}
              label="Xuất điểm QT"
              icon={<DownloadOutlined style={{ fontSize: "1.7rem" }} />}
            ></ImportCard>
          </div>
          <div className="mx-1 my-2">
            <ImportCard
              onClick={onClickDownloadCK}
              label="Xuất điểm CK"
              icon={<DownloadOutlined style={{ fontSize: "1.7rem" }} />}
            ></ImportCard>
          </div>
        </div>
      </div>
      <Modal centered footer={<></>} className="relative" open={downloadModal} onCancel={() => handleCancel()}>
        <div className="create-icon">
          <div>
            <SiMicrosoftexcel />
          </div>
        </div>
        <div className="modal-title-wapper">
          <p className="modal-title">Tải điểm {textTitle}</p>
        </div>
        <Form
          initialValues={{ is_dai_cuong: 1, ki_hoc: kiHienGio }}
          layout="vertical"
          className="base-form"
          onFinish={onFinish}
          form={form}
        >
          <Form.Item label="Kì học" name="ki_hoc">
            <Select options={ki_hocs.map((x) => ({ value: x, label: x }))}></Select>
          </Form.Item>
          <Form.Item label="Mã học phần" name="ma_hps">
            <Select
              loading={loadingMaHp}
              allowClear
              showSearch
              mode="multiple"
              options={maHps?.map((x) => ({ value: x, label: x }))}
            ></Select>
          </Form.Item>
          <Form.Item label="Loại" name="is_dai_cuong">
            <Select
              placeholder={"Chọn loại lớp"}
              allowClear
              className="w-[9rem]"
              options={[
                { label: "Đại cương", value: 1 },
                { label: "Chuyên ngành", value: 0 }
              ]}
            />
          </Form.Item>
          <Form.Item className="flex justify-end items-center">
            <Button className="mr-4" onClick={() => handleCancel()}>
              Huỷ
            </Button>
            <Button htmlType="submit" loading={loading}>
              Xuất file
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
