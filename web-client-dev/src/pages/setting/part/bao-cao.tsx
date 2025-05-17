import { FC, useCallback, useEffect, useState } from "react";
import TimKiemBaoCaoPage from "./bao-cao-tim-kiem";
import { Button, Card, Col, Form, Row, Select, Space, Table, Tooltip, Typography, notification } from "antd";
import configApi from "@/api/config.api";

import Column from "antd/es/table/Column";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import DeleteDialog from "@/components/dialog/deleteDialog";
import CreateNEditDialog from "@/components/createNEditDialog";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/stores/hook";
import { getKiHienGio } from "@/stores/features/config";
import EditBaoCaoDialog from "./bao-cao-edit";
import { BaoCaoSettingConfig } from "./bao-cao-setting";
import { useMediaQuery } from "react-responsive";
const { Title } = Typography;

export const BaoCaoSetting: FC<{
  kiHoc: { label: string; value: string }[];
}> = ({ kiHoc }) => {
  const kiHienGio = useAppSelector(getKiHienGio);
  const { t } = useTranslation(["setting-bao-cao"]);
  const optionsBaoCao = [
    {
      type: "inputnumber",
      name: "mo_bao_cao",
      placeholder: t("hint.mo_bao_cao"),
      label: t("hint.mo_bao_cao"),
      min: 1
    },
    {
      type: "inputnumber",
      name: "dong_bao_cao",
      placeholder: t("hint.dong_bao_cao"),
      label: t("hint.dong_bao_cao"),
      min: 1
    },
    {
      type: "inputnumber",
      name: "dong_tre",
      placeholder: t("hint.dong_tre"),
      label: t("hint.dong_tre"),
      min: 0
    }
  ];
  const [api, contextHolder] = notification.useNotification();
  const [selectedValueBC, setSelectedValueBC] = useState(kiHienGio);
  const [isModalEditBaoCao, setIsModalEditBaoCao] = useState(false);
  const [dataEditBC, setDataEditBC] = useState<any[]>([]);
  const [isEditBC, setIsEditBC] = useState(false);
  const [key, setKeyRender] = useState(1);
  const [isModalDeleteBC, setIsModalDeleteBC] = useState(false);
  const [loadingBC, setLoadingBC] = useState(false);
  const [dataBC, setDataBC] = useState<any[]>([]);
  const getKiHocBaoCao = useCallback(async (value: any) => {
    setLoadingBC(true);
    try {
      setSelectedValueBC(value);
      const res = await configApi.listDongBaoCao({ ki_hoc: value });
      setDataBC(res.data);
    } finally {
      setLoadingBC(false);
    }
  }, []);
  useEffect(() => {
    getKiHocBaoCao(selectedValueBC);
  }, [key]);
  const onUpdateItemBC = (item: any) => {
    setDataEditBC(item);
    setIsEditBC(true);
  };
  const handleCloseEdit = () => {
    setIsEditBC(false);
  };
  const onDeleteItemBC = (item: any) => {
    const maxId = Math.max(...dataBC.map((dataItem) => dataItem.id));
    if (item.id === maxId) {
      setDataEditBC(item);
      setIsModalDeleteBC(true);
    } else {
      api.error({
        message: "Thất bại",
        description: "Bạn không thể xóa lần đánh giá nếu có lần đánh giá được tạo sau đó!"
      });
    }
  };
  const isTable = useMediaQuery({ minWidth: 1000 });

  return (
    <>
      {contextHolder}
      <Row className="p-2" key={key}>
        <Col span={24} className="flex justify-between flex-wrap">
          <div>
            <Form.Item label="Cài đặt theo kì học">
              <Select
                placeholder="Chọn kì học"
                style={{ maxWidth: "160px" }}
                value={selectedValueBC}
                onChange={getKiHocBaoCao}
                options={kiHoc}
              />
            </Form.Item>
          </div>
          <div>{selectedValueBC && <BaoCaoSettingConfig kiHoc={selectedValueBC} />}</div>
          <div>
            {selectedValueBC ? (
              <Button onClick={() => setIsModalEditBaoCao(true)} type="primary">
                Thêm lần đóng đánh giá
              </Button>
            ) : (
              <></>
            )}
          </div>
        </Col>
        {/* Danh sach bao cao */}
        <Col span={24}>
          {selectedValueBC ? (
            <>
              <Title level={4}>Danh sách tuần đóng đánh giá kì học {selectedValueBC}</Title>
              {isTable ? (
                <Table
                  pagination={false}
                  dataSource={dataBC}
                  rowKey="id"
                  loading={loadingBC}
                  style={{ minHeight: "338px" }}
                >
                  <Column title="Lần" key="index" render={(_text, _record, index) => <span>{index + 1}</span>} />
                  <Column
                    title="Tuần mở đánh giá"
                    dataIndex="setting_value"
                    align="center"
                    render={(text) => {
                      const maPhanTu = text.split(/-|,|\[|\]/).filter(Boolean);
                      return <span>{maPhanTu[0]}</span>;
                    }}
                  />
                  <Column
                    title="Tuần đóng đánh giá"
                    dataIndex="setting_value"
                    align="center"
                    render={(text) => {
                      const maPhanTu = text.split(/-|,|\[|\]/).filter(Boolean);
                      return <span>{maPhanTu[1]}</span>;
                    }}
                  />
                  <Column
                    title="Tuần đóng trễ"
                    dataIndex="setting_value"
                    align="center"
                    render={(text) => {
                      const maPhanTu = text.split(/-|,|\[|\]/).filter(Boolean);
                      return <span>{maPhanTu[2]}</span>;
                    }}
                  />
                  <Column
                    title="Hành động"
                    key="action"
                    align="center"
                    render={(_: any, record: any) => (
                      <Space>
                        <Button
                          shape="circle"
                          icon={<EditOutlined />}
                          type="text"
                          onClick={() => onUpdateItemBC(record)}
                        ></Button>
                        <Button
                          shape="circle"
                          icon={<DeleteOutlined />}
                          type="text"
                          onClick={() => onDeleteItemBC(record)}
                        />
                      </Space>
                    )}
                  />
                </Table>
              ) : dataBC.length > 0 ? (
                dataBC.map((record, key) => {
                  return (
                    <Col span={24} key={record.id} className="my-2">
                      <Card>
                        <p className="my-1">
                          <strong>Lần:</strong> {key + 1}
                        </p>
                        <p className="my-1">
                          <strong>Tuần mở đánh giá:</strong>{" "}
                          {record.setting_value.split(/-|,|\[|\]/).filter(Boolean)[0]}
                        </p>
                        <p className="my-1">
                          <strong>Tuần đóng đánh giá:</strong>{" "}
                          {record.setting_value.split(/-|,|\[|\]/).filter(Boolean)[1]}
                        </p>
                        <p className="my-1">
                          <strong>Tuần đóng trễ:</strong> {record.setting_value.split(/-|,|\[|\]/).filter(Boolean)[2]}
                        </p>

                        <div className="flex justify-center">
                          <Tooltip title="Sửa">
                            <Button
                              shape="circle"
                              icon={<EditOutlined />}
                              type="text"
                              onClick={() => {
                                setDataEditBC(record);
                                setIsEditBC(true);
                              }}
                            ></Button>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <Button
                              shape="circle"
                              icon={<DeleteOutlined />}
                              type="text"
                              onClick={() => {
                                const maxId = Math.max(...dataBC.map((dataItem) => dataItem.id));
                                if (record.id === maxId) {
                                  setDataEditBC(record);
                                  setIsModalDeleteBC(true);
                                } else {
                                  api.error({
                                    message: "Thất bại",
                                    description: "Bạn không thể xóa lần đánh giá nếu có lần đánh giá được tạo sau đó!"
                                  });
                                }
                              }}
                            />
                          </Tooltip>
                        </div>
                      </Card>
                    </Col>
                  );
                })
              ) : (
                <div className="p-2 text-center"> Chưa có lần đóng đánh giá nào</div>
              )}
            </>
          ) : (
            <></>
          )}
        </Col>
        {/* Tim Kiem bao cao */}
        {selectedValueBC && (
          <Col span={24} className="pt-10">
            <TimKiemBaoCaoPage key={key} ki_hoc={selectedValueBC} />
          </Col>
        )}
        {isModalDeleteBC && (
          <DeleteDialog
            openModal={isModalDeleteBC}
            translation="setting-bao-cao"
            closeModal={setIsModalDeleteBC}
            name="Đóng đánh giá"
            apiDelete={() => dataEditBC && configApi.deleteDongDiemDanh(dataEditBC)}
            setKeyRender={setKeyRender}
          />
        )}{" "}
        <EditBaoCaoDialog
          callnofi={api}
          openModal={isEditBC}
          closeModal={handleCloseEdit}
          api={configApi.editDongBaoCao}
          data={dataEditBC}
          setKeyRender={setKeyRender}
        />
        <CreateNEditDialog
          apiCreate={(data: any) => {
            configApi.createDongBaoCao({
              mo_bao_cao: data.mo_bao_cao,
              dong_bao_cao: data.dong_bao_cao,
              dong_tre: data.dong_tre,
              ki_hoc: selectedValueBC
            });
          }}
          apiEdit={() => {}}
          options={optionsBaoCao}
          translation={"setting-bao-cao"}
          data={dataEditBC}
          isEdit={isEditBC}
          setIsEdit={setIsEditBC}
          setKeyRender={setKeyRender}
          openModal={isModalEditBaoCao}
          closeModal={setIsModalEditBaoCao}
        />
      </Row>
    </>
  );
};
