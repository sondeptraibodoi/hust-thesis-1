import { DoAnBaoCao } from "@/interface/lop";
import { Button, Space, Table, Typography, notification } from "antd";
import Column from "antd/es/table/Column";
import { FC, useCallback, useEffect, useState } from "react";
import { formatDate } from "@/utils/formatDate";
import lopDoAnApi from "@/api/lop/lopDoAn.api";
import CreateNEditDialog from "@/components/createNEditDialog";
import dayjs, { Dayjs } from "dayjs";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const optionsEdit = [
  {
    type: "date",
    name: "ngay_bao_cao",
    placeholder: "Ngày đánh giá",
    label: "Ngày đánh giá",
    timeFomat: "DD/MM/YYYY",
    propInput: {
      disabledDate: (current: Dayjs) => {
        return current && current > dayjs().endOf("day");
      }
    }
  },
  {
    type: "textarea",
    name: "noi_dung_thuc_hien",
    placeholder: "Nội dung kế hoạch",
    label: "Nội dung kế hoạch"
  },
  {
    type: "textarea",
    name: "noi_dung_da_thuc_hien",
    placeholder: "Nội dung đã thực hiện",
    label: "Nội dung đã thực hiện"
  },
  {
    type: "inputnumber",
    name: "diem_y_thuc",
    placeholder: "Điểm tích cực",
    label: "Điểm tích cực",
    propInput: {
      min: 0,
      max: 10,
      step: 0.5
    }
  },
  {
    type: "inputnumber",
    name: "diem_noi_dung",
    placeholder: "Điểm nội dung",
    label: "Điểm nội dung",
    propInput: {
      min: 0,
      max: 10,
      step: 0.5
    }
  },
  {
    type: "textarea",
    name: "ghi_chu",
    placeholder: "Ghi chú",
    label: "Ghi chú"
  }
];
const DanhGiaDoAnSinhVienList: FC<{
  lopId: number;
  sinhVienId: number;
}> = ({ lopId, sinhVienId }) => {
  const [api, contextHolder] = notification.useNotification();
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [baoCao, setBaoCao] = useState<DoAnBaoCao[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [data, setData] = useState<Partial<DoAnBaoCao>>();
  const [key, setKeyRender] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const onCreateItem = useCallback(() => {
    setIsEdit(false);
    setIsModalEdit(true);
    setData({ lop_id: lopId, sinh_vien_id: sinhVienId, ngay_bao_cao: dayjs() });
  }, []);
  const onUpdateItem = useCallback((item: DoAnBaoCao) => {
    item = { ...item };
    if (item.ngay_bao_cao) {
      item.ngay_bao_cao = dayjs(item.ngay_bao_cao).tz("Asia/Ho_Chi_Minh");
    }
    setData(item);
    setIsModalEdit(true);
    setIsEdit(true);
  }, []);
  const onDeleteItem = useCallback(
    (item: DoAnBaoCao) => {
      const maxId = Math.max(...baoCao.map((dataItem) => dataItem.id));
      if (item.id === maxId) {
        setData(item);
        setIsModalDelete(true);
      } else {
        api.error({
          message: "Thất bại",
          description: "Bạn không thể xóa lần đánh giá nếu có lần đánh giá được tạo sau đó!"
        });
      }
    },
    [baoCao]
  );
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const res = await lopDoAnApi.list(lopId, sinhVienId);
        setBaoCao(res);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [lopId, sinhVienId, key]);
  return (
    <>
      {contextHolder}
      <div className="d-flex items-center justify-between">
        <Typography.Title level={3}>Đánh giá đồ án</Typography.Title>
        <Button type="primary" onClick={onCreateItem}>
          Tạo mới
        </Button>
      </div>
      <Table rowKey="id" dataSource={baoCao} pagination={false} loading={loading}>
        <Column
          title="Ngày đánh giá"
          dataIndex="ngay_bao_cao"
          key="ngay_bao_cao"
          render={(_: any, record: DoAnBaoCao) => {
            return <Space size="middle">{formatDate(record.ngay_bao_cao)}</Space>;
          }}
        />
        <Column title="Lần" dataIndex="lan" key="lan" />
        <Column
          title="Nội dung kế hoạch"
          dataIndex="noi_dung_thuc_hien"
          key="noi_dung_thuc_hien"
          render={(_: any, record: DoAnBaoCao) => {
            return <div className="whitespace-pre-wrap">{record.noi_dung_thuc_hien}</div>;
          }}
        />
        <Column
          title="Nội dung đã thực hiện"
          dataIndex="noi_dung_da_thuc_hien"
          key="noi_dung_da_thuc_hien"
          render={(_: any, record: DoAnBaoCao) => {
            return <div className="whitespace-pre-wrap">{record.noi_dung_da_thuc_hien}</div>;
          }}
        />
        <Column title="Điểm tích cực" dataIndex="diem_y_thuc" key="diem_y_thuc" />
        <Column title="Điểm nội dung" dataIndex="diem_noi_dung" key="diem_noi_dung" />
        <Column
          title="Ghi chú"
          dataIndex="ghi_chu"
          key="ghi_chu"
          render={(_: any, record: DoAnBaoCao) => {
            return <div className="whitespace-pre-wrap">{record.ghi_chu}</div>;
          }}
        />
        <Column
          title="Hành động"
          key="action"
          width={120}
          align="center"
          render={(_: any, record: DoAnBaoCao) => (
            <Space size="middle">
              <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(record)} />
              <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(record)} />
            </Space>
          )}
        />
      </Table>
      {isModalEdit && (
        <CreateNEditDialog
          apiCreate={(temp: any) => lopDoAnApi.create({ ...data, ...temp })}
          apiEdit={lopDoAnApi.edit}
          options={optionsEdit}
          translation={"do-an-danh-gia"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          closeModal={setIsModalEdit}
          isFillData
        />
      )}
      <DeleteDialog
        openModal={isModalDelete}
        translation={"do-an-danh-gia"}
        closeModal={setIsModalDelete}
        name="lần điểm danh"
        apiDelete={() => data && lopDoAnApi.delete(data as any)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};
export default DanhGiaDoAnSinhVienList;
