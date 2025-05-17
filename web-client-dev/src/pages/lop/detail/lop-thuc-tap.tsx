import { Button, Space, Table, Tag, Typography } from "antd";

import Column from "antd/es/table/Column";
import { SinhVienThucTap } from "@/interface/lop";
import { FC, useEffect, useState } from "react";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import thuctapApi from "@/api/lop/thuctap.api";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import ViewDialog from "@/pages/giao-vien/lop-do-an/viewDialog";

const TableLopThucTap: FC<any> = ({ lop }) => {
  const [thucTap, setThucTap] = useState<SinhVienThucTap[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalEditor, setModalEditor] = useState(false);
  const { Title } = Typography;
  const [data, setData] = useState<SinhVienThucTap>();
  const [keyRender, setKeyRender] = useState(0);
  const [modalView, setModalView] = useState<boolean>(false);

  const options = [
    {
      key: "0",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "4",
      label: "Mã sinh viên",
      children: data?.mssv
    },
    {
      key: "5",
      label: "Tên sinh viên",
      children: data?.sinh_vien
    },
    {
      key: "6",
      label: "Tên công ty",
      children: data?.ten_cong_ty
    },
    {
      key: "7",
      label: "Địa chỉ",
      children: data?.dia_chi
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Trạng thái",
      children: StatusViewRender(data?.trang_thai)
    }
  ];
  const optionsView = [
    {
      key: "0",
      label: "Kì học",
      children: data?.ki_hoc
    },
    {
      key: "2",
      label: "Mã học phần",
      children: data?.ma_hp
    },
    {
      key: "3",
      label: "Tên học phần",
      children: data?.ten_hp
    },
    {
      key: "4",
      label: "Mã sinh viên",
      children: data?.mssv
    },
    {
      key: "5",
      label: "Tên sinh viên",
      children: data?.sinh_vien
    },
    {
      key: "6",
      label: "Tên công ty",
      children: data?.ten_cong_ty
    },
    {
      key: "7",
      label: "Địa chỉ",
      children: data?.dia_chi
    },
    {
      key: "8",
      label: "Ghi chú",
      children: data?.ghi_chu
    },
    {
      key: "9",
      label: "Trạng thái",
      children: StatusViewRender(data?.trang_thai)
    }
  ];
  const getThucTap = async () => {
    setLoading(true);
    try {
      const res = await thuctapApi.listThucTap(lop?.id);
      setThucTap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getThucTap();
  }, [keyRender]);
  const onEditItem = (record: SinhVienThucTap) => {
    setData(record);
    setModalEditor(true);
  };
  const onViewItem = (record: SinhVienThucTap) => {
    setData(record);
    setModalView(true);
  };
  return (
    <>
      <div className="mb-2 text-center">
        <Title className="pb-2 mt-5" level={3}>
          Danh sách đơn thực tập
        </Title>
      </div>
      <Table rowKey="sinh_vien_id" dataSource={thucTap} pagination={false} loading={loading} scroll={{ y: 500 }}>
        <Column title="Mã lớp học" dataIndex={"ma"} key={"ma"} />
        <Column title="MSSV" dataIndex={"mssv"} key={"mssv"} />
        <Column title="Tên sinh viên" dataIndex={"sinh_vien"} key={"sinh_vien"} />
        <Column title="Tên Công ty" dataIndex="ten_cong_ty" key="ten_cong_ty" />
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
            } else {
              return <Tag className="bg-yellow-200 text-rose-500">Chưa có</Tag>;
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
              {!["2-tu-choi", "1-duyet", null].includes(record.trang_thai) ? (
                <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onEditItem(record)} />
              ) : (
                <Button shape="circle" icon={<EyeOutlined />} type="text" onClick={() => onViewItem(record)} />
              )}
            </Space>
          )}
        />
      </Table>
      <ConfirmDialog
        openModal={modalEditor}
        name={data?.sinh_vien}
        closeModal={setModalEditor}
        setKeyRender={setKeyRender}
        apiConfirm={thuctapApi.duyetThucTap}
        translation={"duyet-thuc-tap"}
        id={data?.id}
        data={data}
        title={"Duyệt phiếu thực tập"}
        options={options}
      />
      <ViewDialog
        openModal={modalView}
        closeModal={setModalView}
        translation={"duyet-thuc-tap"}
        title={"Xem phiếu thực tập"}
        apiConfirm={thuctapApi.duyetThucTap}
        optionsView={optionsView}
        id={data?.id}
        setKeyRender={setKeyRender}
        backAgree={data?.trang_thai == "1-duyet" ? true : false}
      />
    </>
  );
};

export default TableLopThucTap;
const StatusViewRender: FC<any> = (record) => {
  if (record === "0-moi-gui") {
    return <Tag>Mới gửi</Tag>;
  } else if (record === "2-tu-choi") {
    return <Tag color="error">Từ chối</Tag>;
  } else if (record === "1-duyet") {
    return <Tag color="success">Đã duyệt</Tag>;
  } else if (record === null) {
    return <Tag className="bg-yellow-200 text-rose-500">Chưa có</Tag>;
  } else {
    <Tag className="bg-yellow-200 text-rose-500">Chưa có</Tag>;
  }
};
