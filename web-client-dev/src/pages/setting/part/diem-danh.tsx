import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { Button, Col, Row, Select, Typography, Form, Table, Space, notification, Card, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import Column from "antd/es/table/Column";
import configApi from "@/api/config.api";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import TimKiemPage from "./diem-danh-tim-kiem";
import { useTranslation } from "react-i18next";
import EditSettingDialog from "./diem-danh-edit";
import CreateNEditDialog from "@/components/createNEditDialog";

import DeleteDialog from "@/components/dialog/deleteDialog";
import { useMediaQuery } from "react-responsive";
interface DongDiemDanh {
  section_name: string;
  setting_name: string;
  setting_type: string;
  setting_value: string;
  id: number;
  created_at: string;
  updated_at: string;
}

const { Title } = Typography;
export const DiemDanhSetting: FC<{
  kiHoc: { label: string; value: string }[];
}> = ({ kiHoc }) => {
  const { t } = useTranslation(["setting"]);
  const [api, contextHolder] = notification.useNotification();
  const [key, setKeyRender] = useState(1);
  const [data, setData] = useState<DongDiemDanh[]>([]);
  const [loading, setLoading] = useState(false);
  const kiHienGio = useAppSelector(getKiHienGio);
  const [isEdit, setIsEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState<DongDiemDanh[]>([]);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [selectedValue, setSelectedValue] = useState(kiHienGio);
  const handleCloseEdit = () => {
    setIsEdit(false);
  };

  const options = [
    {
      type: "inputnumber",
      name: "mo_diem_danh",
      placeholder: t("hint.mo_diem_danh"),
      label: t("hint.mo_diem_danh"),
      min: 1
    },
    {
      type: "inputnumber",
      name: "dong_diem_danh",
      placeholder: t("hint.dong_diem_danh"),
      label: t("hint.dong_diem_danh"),
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
  const onUpdateItem = (item: any) => {
    setDataEdit(item);
    setIsEdit(true);
  };
  const onDeleteItem = (item: any) => {
    const maxId = Math.max(...data.map((dataItem) => dataItem.id));
    if (item.id === maxId) {
      setDataEdit(item);
      setIsModalDelete(true);
    } else {
      api.error({
        message: "Thất bại",
        description: "Bạn không thể xóa lần điểm danh nếu có lần điểm danh được tạo sau đó!"
      });
    }
  };
  const getKiHocSetting = useCallback(async (value: any) => {
    setLoading(true);
    try {
      setSelectedValue(value);
      const res = await configApi.listDongDiemDanh({ ki_hoc: value });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getKiHocSetting(selectedValue);
  }, [key]);
  const isTable = useMediaQuery({ minWidth: 1000 });

  return (
    <>
      {contextHolder}
      <Row className="p-2">
        <Col span={24} className="flex justify-between flex-wrap">
          <div>
            <Form.Item label="Cài đặt theo kì học">
              <Select
                placeholder="Chọn kì học"
                style={{ maxWidth: "160px" }}
                value={selectedValue}
                onChange={getKiHocSetting}
                options={kiHoc}
              />
            </Form.Item>
          </div>
          <div>
            {selectedValue ? (
              <Button onClick={() => setIsModalEdit(true)} type="primary">
                Thêm lần đóng điểm danh
              </Button>
            ) : (
              <></>
            )}
          </div>
        </Col>
        <Col span={24}>
          {selectedValue ? (
            <>
              <Title level={4}>Danh sách tuần đóng điểm danh kì học {selectedValue}</Title>
              {isTable ? (
                <Table
                  pagination={false}
                  dataSource={data}
                  rowKey="id"
                  loading={loading}
                  style={{ minHeight: "338px" }}
                >
                  <Column title="Lần" key="index" render={(_text, _record, index) => <span>{index + 1}</span>} />
                  <Column
                    title="Tuần mở điểm danh"
                    dataIndex="setting_value"
                    align="center"
                    render={(text) => {
                      const maPhanTu = text.split(/-|,|\[|\]/).filter(Boolean);
                      return <span>{maPhanTu[0]}</span>;
                    }}
                  />
                  <Column
                    title="Tuần đóng điểm danh"
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
                          onClick={() => onUpdateItem(record)}
                        ></Button>
                        <Button
                          shape="circle"
                          icon={<DeleteOutlined />}
                          type="text"
                          onClick={() => onDeleteItem(record)}
                        />
                      </Space>
                    )}
                  />
                </Table>
              ) : (
                data.map((record: any, key) => {
                  return (
                    <Col span={24} key={record.id} className="my-2">
                      <Card>
                        <p className="my-1">
                          <strong>Lần:</strong> {key + 1}
                        </p>
                        <p className="my-1">
                          <strong>Tuần mở điểm danh:</strong>{" "}
                          {record.setting_value.split(/-|,|\[|\]/).filter(Boolean)[0]}
                        </p>
                        <p className="my-1">
                          <strong>Tuần đóng điểm danh:</strong>{" "}
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
                                setDataEdit(record);
                                setIsEdit(true);
                              }}
                            ></Button>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <Button
                              shape="circle"
                              icon={<DeleteOutlined />}
                              type="text"
                              onClick={() => {
                                const maxId = Math.max(...data.map((dataItem) => dataItem.id));
                                if (record.id === maxId) {
                                  setDataEdit(record);
                                  setIsModalDelete(true);
                                } else {
                                  api.error({
                                    message: "Thất bại",
                                    description: "Bạn không thể xóa lần điểm danh nếu có lần điểm danh được tạo sau đó!"
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
              )}
            </>
          ) : (
            <></>
          )}
        </Col>
        <Col span={24} className="pt-10">
          <div>
            <Title level={4}>Tìm kiếm chi tiết đóng mở điểm danh theo tuần của lớp học</Title>
            <TimKiemPage />
          </div>
        </Col>
      </Row>

      {isModalEdit && (
        <CreateNEditDialog
          apiCreate={(data: any) => {
            configApi.createDongDiemDanh({
              mo_diem_danh: data.mo_diem_danh,
              dong_diem_danh: data.dong_diem_danh,
              dong_tre: data.dong_tre,
              ki_hoc: selectedValue
            });
          }}
          apiEdit={() => {}}
          options={options}
          translation={"setting"}
          data={dataEdit}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          closeModal={setIsModalEdit}
        />
      )}

      <EditSettingDialog
        callnofi={api}
        openModal={isEdit}
        closeModal={handleCloseEdit}
        api={configApi.editDongDiemDanh}
        data={dataEdit}
        setKeyRender={setKeyRender}
      />

      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          translation="setting"
          closeModal={setIsModalDelete}
          name="Đóng điểm danh"
          apiDelete={() => dataEdit && configApi.deleteDongDiemDanh(dataEdit)}
          setKeyRender={setKeyRender}
        />
      )}
    </>
  );
};
