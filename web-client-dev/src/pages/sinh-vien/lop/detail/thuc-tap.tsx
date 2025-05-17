import { Button, Card, Col, Space, Table, Tag, Tooltip } from "antd";

import Column from "antd/es/table/Column";
import { SinhVienThucTap } from "@/interface/lop";
import { FC, useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CreateNEditDialog from "@/components/createNEditDialog";
import { useTranslation } from "react-i18next";
import thuctapApi from "@/api/lop/thuctap.api";
import { useAppSelector } from "@/stores/hook";
import { getAuthUser } from "@/stores/features/auth";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { useParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const TableThucTap: FC<any> = ({ lop_id }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<SinhVienThucTap>();
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [isModalDelete, setIsModalDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyRender, setKeyRender] = useState(0);
  const [thucTap, setThucTap] = useState<SinhVienThucTap[]>();
  const param = useParams();
  const [disableSubTitle, setDisableSubTitle] = useState<boolean>(false);

  const { t } = useTranslation("thuc-tap");
  const authUser = useAppSelector(getAuthUser);
  const authUser_id = authUser?.info.id;
  const optionsEdit = [
    {
      type: "input",
      name: "ten_cong_ty",
      placeholder: t("field.ten_cong_ty"),
      label: t("field.ten_cong_ty"),
      disabled: false,
      rule: [
        {
          require: true,
          message: t("required.email")
        }
      ]
    },
    {
      type: "textarea",
      name: "dia_chi",
      placeholder: t("field.dia_chi"),
      label: t("field.dia_chi"),
      disabled: false
    },
    {
      type: "textarea",
      name: "ghi_chu",
      placeholder: t("field.ghi_chu"),
      label: t("field.ghi_chu"),
      disabled: false
    }
  ];
  const onEditItem = (record: SinhVienThucTap) => {
    if (record.trang_thai === "0-moi-gui") {
      setIsEdit(true);
      setModalEditor(true);
      setData(record);
    }
  };
  const onDeleteItem = (record: SinhVienThucTap) => {
    if (record.trang_thai === "0-moi-gui" || record.trang_thai === "2-tu-choi") {
      setIsModalDelete(true);
      setData(record);
    }
  };

  const onCreateItem = () => {
    const filteredData = thucTap?.filter(
      (item: SinhVienThucTap) => item.trang_thai === "0-moi-gui" || item.trang_thai === "1-duyet"
    );
    if (filteredData && filteredData.length === 0) {
      setIsEdit(false);
      setModalEditor(true);
      setDisableSubTitle(true);
    }
  };
  const checkAdd = thucTap?.filter(
    (item: SinhVienThucTap) => item.trang_thai === "0-moi-gui" || item.trang_thai === "1-duyet"
  );
  const getThucTap = async () => {
    setLoading(true);
    try {
      const res = await thuctapApi.getThucTap(param.id);
      setThucTap(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getThucTap();
  }, [keyRender]);
  const isMobile = useMediaQuery({ maxWidth: 600 });

  return (
    <>
      {(checkAdd?.length == 0 ? true : false) && (
        <div className="text-end mb-3">
          <Button type="primary" onClick={() => onCreateItem()}>
            Đăng ký
          </Button>
        </div>
      )}

      {isMobile ? (
        <div className="card-container card-chi-tiet-diem-danh">
          {thucTap && thucTap.length > 0 ? (
            thucTap?.map((record) => (
              <Col span={24} key={record.id}>
                <Card>
                  <p className="my-1">
                    <strong>Lớp:</strong> {record.ma_lop}
                  </p>
                  <p className="my-1">
                    <strong>Tên công ty:</strong> {record.ten_cong_ty}
                  </p>
                  <p className="my-1">
                    <strong>Địa chỉ:</strong> {record.dia_chi}
                  </p>
                  <p className="my-1">
                    <strong>Ghi chú:</strong> {record.ghi_chu}
                  </p>
                  <p className="my-1">
                    <strong>Trạng thái:</strong>{" "}
                    {record.trang_thai === "0-moi-gui" ? (
                      <Tag>Mới gửi</Tag>
                    ) : record.trang_thai === "2-tu-choi" ? (
                      <Tag color="error">Từ chối</Tag>
                    ) : record.trang_thai === "1-duyet" ? (
                      <Tag color="success">Đã duyệt</Tag>
                    ) : (
                      record.trang_thai
                    )}
                  </p>
                  <div className="flex justify-center">
                    <Tooltip title="Sửa">
                      <Button
                        shape="circle"
                        icon={<EditOutlined />}
                        type="text"
                        disabled={["2-tu-choi", "1-duyet"].includes(record.trang_thai) ?? true}
                        onClick={() => onEditItem(record)}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button
                        shape="circle"
                        icon={<DeleteOutlined />}
                        type="text"
                        disabled={["1-duyet"].includes(record.trang_thai) ?? true}
                        onClick={() => onDeleteItem(record)}
                      />
                    </Tooltip>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <div className="p-2 text-center"> Chưa có phiếu thực tập nào</div>
          )}
        </div>
      ) : (
        <Table rowKey="id" dataSource={thucTap} pagination={false} scroll={{ y: 500 }} loading={loading}>
          <Column title="Lớp" dataIndex={"ma_lop"} key={"ma_lop"} />
          <Column title="Tên công ty" dataIndex="ten_cong_ty" key="ten_cong_ty" />
          <Column title="Địa chỉ" dataIndex="dia_chi" key="dia_chi" />
          <Column title="Ghi chú" dataIndex="ghi_chu" key="ghi_chu" />
          <Column
            title="Trạng thái"
            dataIndex="trang_thai"
            key="trang_thai"
            render={(_: any, record: SinhVienThucTap) => {
              if (record.trang_thai === "0-moi-gui") {
                return <Tag>Mới gửi</Tag>;
              } else if (record.trang_thai === "2-tu-choi") {
                return <Tag color="error">Từ chối</Tag>;
              } else if (record.trang_thai === "1-duyet") {
                return <Tag color="success">Đã duyệt</Tag>;
              }
            }}
          />
          <Column
            title="Hành động"
            key="action"
            // width="20%"
            align="center"
            render={(_: any, record: SinhVienThucTap) => (
              <Space size="middle">
                <Button
                  shape="circle"
                  icon={<EditOutlined />}
                  type="text"
                  disabled={["2-tu-choi", "1-duyet"].includes(record.trang_thai) ?? true}
                  onClick={() => onEditItem(record)}
                />
                <Button
                  shape="circle"
                  icon={<DeleteOutlined />}
                  type="text"
                  disabled={["1-duyet"].includes(record.trang_thai) ?? true}
                  onClick={() => onDeleteItem(record)}
                />
              </Space>
            )}
          />
        </Table>
      )}
      <CreateNEditDialog
        apiCreate={(params: any) =>
          thuctapApi.create({
            ...params,
            lop_id: lop_id,
            sinh_vien_id: authUser_id
          })
        }
        apiEdit={thuctapApi.edit}
        options={optionsEdit}
        translation={"thuc-tap"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={modalEditor}
        closeModal={setModalEditor}
        disableSubTitle={disableSubTitle}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="thuc-tap"
        closeModal={setIsModalDelete}
        name="phiếu thực tập"
        apiDelete={() => data && thuctapApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

export default TableThucTap;
