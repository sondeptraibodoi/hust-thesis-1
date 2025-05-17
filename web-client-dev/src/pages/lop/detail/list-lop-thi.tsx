import { LopThi, Lop, LoaiLopThi } from "@/interface/lop";
import { Button, Table, Typography, Space, Card, Tooltip, Modal, message as $message } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import Column from "antd/es/table/Column";
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  OrderedListOutlined
} from "@ant-design/icons";
import CreateNEditDialog from "./modal-add-lop-thi";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Link } from "react-router-dom";
import lopThiApi from "@/api/lop/lopThi.api";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { MdEmail } from "react-icons/md";

const { Title } = Typography;
const ListLopThiPage: FC<{ lop: Lop; disabledCreate?: boolean }> = ({ lop, disabledCreate }) => {
  const { format: formatDotThi } = useLoaiLopThi();
  const { t } = useTranslation("lop-thi");
  const [loading, setLoading] = useState(false);
  const [key, setKeyRender] = useState(0);
  const [dataSource, setDataSource] = useState<LopThi[]>([]);
  const [loaiThi, setLoaiThi] = useState<LoaiLopThi[]>([]);

  useEffect(() => {
    const getLoaiThi = async () => {
      const res = await lopThiApi.listLoaiThi();
      setLoaiThi(res.data);
    };
    getLoaiThi();
  }, []);

  const options = [
    {
      type: "input",
      name: "ma",
      label: t("field.ma_lop_thi")
    },
    {
      type: "select",
      name: "loai",
      label: t("field.loai"),
      children: loaiThi.map((item: any) => {
        return { title: item.title, value: item.value };
      })
    }
  ];

  const getData = useCallback(async () => {
    setLoading(true);
    let items: LopThi[] = [];
    try {
      const res = await lopThiApi.list({ lop_id: lop.id });
      items = res.data.list;
      setDataSource(items);
    } finally {
      setLoading(false);
    }
  }, [lop]);
  useEffect(() => {
    getData();
  }, [key]);
  const [data, setData] = useState<LopThi>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const isMobile = useMediaQuery({ minWidth: 600 });
  const [openComfirm, setOpenComfirm] = useState(false);
  const [lopThiSendMail, setLopThiSendMail] = useState<LopThi>();
  const onDeleteItem = (item: LopThi) => {
    setData(item);
    setIsModalDelete(true);
  };
  const onSendMail = (item: LopThi) => {
    setLopThiSendMail(item);
    setOpenComfirm(true);
  };
  const customTableStyle = {
    border: "1px solid #e8e8e8",
    borderRadius: "5px"
  };
  const handleSendEmail = useCallback(() => {
    setOpenComfirm(false);
    if (lopThiSendMail)
      lopThiApi
        .sendEmail(lopThiSendMail.id)
        .then((res) => {
          $message.info(res.data);
        })
        .finally(() => {
          setLopThiSendMail(undefined);
        });
  }, [lopThiSendMail]);
  return (
    <>
      <Modal
        centered
        open={openComfirm}
        cancelText={t("action.cancel")}
        okText={t("action.accept")}
        onOk={handleSendEmail}
        onCancel={() => setOpenComfirm(false)}
      >
        <div className="delete-icon">
          <div>
            <MdEmail />
          </div>
        </div>
        <div className="modal-title-wapper">
          <p className="modal-suptitle">
            Bạn có chắc muốn gửi email tới lớp thi: {lopThiSendMail && lopThiSendMail.ma}
          </p>
        </div>
      </Modal>
      {isMobile ? (
        <>
          <div className="d-flex items-center justify-between">
            <Typography.Title level={3}>Danh sách lớp thi</Typography.Title>
            {!disabledCreate && (
              <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Tạo mới
              </Button>
            )}
          </div>
          <Table pagination={false} dataSource={dataSource} loading={loading} rowKey="id" style={customTableStyle}>
            <Column title="Lớp thi" dataIndex="ma" key="ma" align="center" width={200} />
            <Column
              title="Đợt thi"
              dataIndex="loai"
              key="loai"
              align="center"
              // width={120}
              render={(record) => {
                return formatDotThi(record);
              }}
            />
            <Column
              title="Hành động"
              key="action"
              width={120}
              align="center"
              render={(_: any, record: LopThi) => (
                <Space size="middle">
                  <Tooltip title="Gửi email">
                    <Button
                      shape="circle"
                      icon={<MdEmail />}
                      type="text"
                      disabled={!!lopThiSendMail}
                      onClick={() => onSendMail(record)}
                    />
                  </Tooltip>
                  <Tooltip title="Soát điểm">
                    <Link to={"sinh-vien/" + record.id}>
                      <Button shape="circle" icon={<CheckSquareOutlined />} type="text" />
                    </Link>
                  </Tooltip>
                  <Tooltip title="Danh sách">
                    <Link to={"danh-sach/" + record.id}>
                      <Button shape="circle" type="text" icon={<MenuOutlined />} />
                    </Link>
                  </Tooltip>
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setIsEdit(true);
                        setIsModalOpen(true);
                        setData(record);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Xoá">
                    <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(record)} />
                  </Tooltip>
                </Space>
              )}
            />
          </Table>
        </>
      ) : (
        <>
          <div className="d-flex items-center justify-between">
            <Title level={3}>Danh sách lớp thi</Title>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Tạo mới
            </Button>
          </div>
          <div className="card-container card-diem-danh">
            {dataSource.map((record: LopThi) => (
              <Card
                key={record.id}
                title={
                  <>
                    <strong className="card-diem-danh__title">Lớp thi: </strong>
                    <span className="card-diem-danh__sub">{record.ma}</span>
                  </>
                }
                actions={[
                  <Tooltip title="Soát điểm">
                    <Link to={"bang-diem/" + record.id}>
                      <OrderedListOutlined key="details" />
                    </Link>
                  </Tooltip>,
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      key="edit"
                      onClick={() => {
                        setIsEdit(true);
                        setIsModalOpen(true);
                        setData(record);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Xoá">
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      key="edit"
                      onClick={() => onDeleteItem(record)}
                    />
                  </Tooltip>
                ]}
              >
                <p>
                  <strong>Đợt thi: </strong>
                  {formatDotThi(record.loai)}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
      <CreateNEditDialog
        apiCreate={lopThiApi.create}
        apiEdit={lopThiApi.edit}
        options={options}
        translation={"lop-thi"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalOpen}
        closeModal={setIsModalOpen}
        createIdLop={lop.id}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="lop-thi"
        closeModal={setIsModalDelete}
        name="Lớp thi"
        apiDelete={() => data && lopThiApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

export default ListLopThiPage;
