import baoLoiCuaSv from "@/api/user/baoLoiCuaSv.api";
import { ActionField } from "@/interface/common";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Tag, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import PageContainer from "@/Layout/PageContainer";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { useKiHoc } from "@/hooks/useKiHoc";
import { Paginate } from "@/interface/axios";
import { DanhSachLoiSv } from "@/interface/sinhVien";
import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { DeleteOutlined } from "@ant-design/icons";
import { PaginationProps } from "antd/lib";
import FormAddNotifyError from "./detail/modal";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const DanhSachLoiCuaSinhVien = () => {
  const { t } = useTranslation("bao-loi-sinh-vien");
  const { items: kiHoc } = useKiHoc();
  const [isEdit, setIsEdit] = useState(false);
  const kiHienGio = useAppSelector(getKiHienGio);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () =>
    kiHienGio && <DanhSachLoiCuaSinhVienDesktop kiHoc={kiHoc} key={keyRender} kiHienGio={kiHienGio} />;
  const contentMobile = () =>
    kiHienGio && <DanhSachLoiCuaSinhVienMobile kiHoc={kiHoc} kiHienGio={kiHienGio} key={keyRender} />;
  return (
    <>
      <PageContainer
        title="Danh sách báo lỗi"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button type="primary" onClick={() => setIsModalEdit(true)}>
              {t("action.create_new")}
            </Button>
          </Space>
        }
      >
        <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
        <FormAddNotifyError
          isEdit={isEdit}
          setEdit={setIsEdit}
          showModal={isModalEdit}
          setShowModal={setIsModalEdit}
          setKeyRender={setKeyRender}
        />
      </PageContainer>
    </>
  );
};

export default DanhSachLoiCuaSinhVien;

const DanhSachLoiCuaSinhVienDesktop: FC<{
  kiHoc: string[];
  key: number;
  kiHienGio: string;
}> = ({ kiHienGio }) => {
  const { t } = useTranslation("bao-loi-sinh-vien");
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [data, setData] = useState<DanhSachLoiSv>();
  const [keyRender, setKeyRender] = useState(0);
  const { getData } = useKiHoc();

  const [columnDefs] = useState<ColDef<DanhSachLoiSv & ActionField>[]>([
    {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData
      }
    },
    {
      headerName: t("field.lop_id"),
      field: "ma",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ten_hp"),
      field: "ten_hp",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.tieu_de"),
      field: "tieu_de",
      filter: "agTextColumnFilter"
    },

    {
      headerName: t("field.loai"),
      field: "ly_do",
      filter: SelectFilter,
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Loại",
        data: loai
      }
    },
    {
      headerName: t("field.ghi_chu"),
      field: "ghi_chu",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai",
      filter: SelectFilter,
      cellRenderer: (params: any) => {
        return params.value === 1 ? <Tag color="success">Đã xử lý</Tag> : <Tag color="error">Chưa xử lý</Tag>;
      },
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Trạng thái",
        data: trangThaiOption
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onDeleteItem: (item: DanhSachLoiSv) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false,
      cellStyle: { textAlign: "center" }
    }
  ]);
  const [initFilter] = useState({
    ki_hoc: {
      filterType: "text",
      type: "contains",
      filter: kiHienGio
    }
  });
  return (
    <>
      <BaseTable
        columns={columnDefs}
        key={keyRender}
        api={baoLoiCuaSv.list}
        gridOption={{ defaultColDef: defaultColDef }}
        initFilter={initFilter}
      ></BaseTable>
      <DeleteDialog
        openModal={isModalDelete}
        translation="bao-loi"
        closeModal={setIsModalDelete}
        name={data?.ma}
        apiDelete={() => {
          data && baoLoiCuaSv.delete(data);
          setKeyRender(Math.random());
        }}
      />
    </>
  );
};

const DanhSachLoiCuaSinhVienMobile: FC<{
  kiHoc: string[];
  kiHienGio: string;
}> = ({ kiHoc, kiHienGio }) => {
  const [dataSource, setDataSource] = useState<DanhSachLoiSv[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [data, setData] = useState<DanhSachLoiSv>();
  const [keyRender, setKeyRender] = useState(0);
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  };
  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1
  });
  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await baoLoiCuaSv.list(filter);
      if (res.data.list.length > 0) {
        setDataSource(res.data.list);
        setPagination((state) => {
          return {
            ...state,
            total: res.data.pagination.total
          };
        });
      } else {
        setDataSource([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = useCallback((current: number, pageSize: number) => {
    setPagination((state) => {
      return {
        ...state,
        itemsPerPage: pageSize,
        page: current
      };
    });
  }, []);
  const handleFieldChanged = (field: string, value: any) => {
    form.setFieldsValue({ [field]: value });
    onSubmit(form.getFieldsValue());
  };
  const onSubmit = (filter: any) => {
    const sendData = {
      filterModel: {
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        },
        ma: {
          filterType: "text",
          type: "contains",
          filter: filter.ma
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    getData(sendData);
  };

  useEffect(() => {
    form.setFieldsValue({ ki_hoc: kiHienGio });
    onSubmit({ ki_hoc: kiHienGio });
  }, []);

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page, keyRender]);

  const Filter = (
    <Form
      form={form}
      layout="vertical"
      {...layout}
      labelWrap
      onFinish={onSubmit}
      initialValues={{
        ki_hoc: kiHienGio
      }}
    >
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ki_hoc" label="Kì học">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("ki_hoc", value);
              }}
            >
              {kiHoc.map((item) => (
                <Select.Option key={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã lớp học">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_hp" label="Tên học phần">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={24} className="flex justify-end">
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </Col>
      </Row>
    </Form>
  );

  let Content = undefined;
  if (loading) {
    Content = (
      <div className="p-2">
        {" "}
        <Spin />{" "}
      </div>
    );
  } else if (dataSource.length == 0) {
    Content = <div className="p-2 text-center"> Sinh viên chưa gửi báo lỗi nào</div>;
  } else {
    Content = (
      <>
        {dataSource.map((record, key) => {
          return (
            <Col span={24} key={record.id} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>STT:</strong> {key + 1}
                </p>
                <p className="my-1">
                  <strong>Kì học:</strong> {record.ki_hoc}
                </p>
                <p className="my-1">
                  <strong>Mã lớp học:</strong> {record.ma}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Tiêu đề:</strong> {record.tieu_de}
                </p>
                <p className="my-1">
                  <strong>Loại:</strong> {record.ly_do}
                </p>
                <p className="my-1">
                  <strong>Ghi chú:</strong> {record.ghi_chu}
                </p>
                <p className="my-1">
                  <strong>Trạng thái: </strong>
                  {record.trang_thai === 1 ? "Đã xử lý" : "Chưa xử lý"}
                </p>
                <div className="flex justify-center">
                  <Tooltip title="Xoá">
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => {
                        setData(record);
                        setIsModalDelete(true);
                      }}
                    />
                  </Tooltip>
                </div>
              </Card>
            </Col>
          );
        })}

        <div
          className="flex justify-between items-center flex-grow-0"
          style={{
            padding: " 8px 0"
          }}
        >
          <Pagination
            current={pagination.page}
            pageSize={pagination.itemsPerPage}
            showSizeChanger
            onChange={onShowSizeChange}
            total={pagination.total}
          />
          <div className="px-2">Tổng số: {pagination.total || 0}</div>
        </div>
      </>
    );
  }

  return (
    <div>
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">
        {Content}
        <DeleteDialog
          openModal={isModalDelete}
          translation="bao-loi"
          closeModal={setIsModalDelete}
          name={data?.ma}
          apiDelete={() => {
            data && baoLoiCuaSv.delete(data);
            setKeyRender(Math.random());
          }}
        />
      </div>
    </div>
  );
};

const loai = [
  { key: "option1", value: "Chưa có điểm" },
  { key: "option2", value: "Sai điểm" },
  { key: "option3", value: "Khác" }
];
const trangThaiOption = [
  { key: "option1", value: "Đã xử lý" },
  { key: "option2", value: "Chưa xử lý" }
];

// const TrangThaiRender: FC<{ data: DanhSachLoiSv }> = ({ data }) => {
//   if (!data) {
//     return <span></span>;
//   }
//   if (data?.trang_thai) {
//     return (
//       <b
//         style={{
//           color: "#008000",
//           backgroundColor: "#caffca",
//           width: "fit-content",
//           height: "fit-content",
//           textAlign: "center",
//           borderRadius: "8px",
//           padding: "2px 8px",
//           margin: "0"
//         }}
//       >
//         Đã xử lý
//       </b>
//     );
//   } else {
//     return (
//       <b
//         style={{
//           color: "#ff8214",
//           backgroundColor: "#fff9ce",
//           width: "fit-content",
//           height: "fit-content",
//           textAlign: "center",
//           borderRadius: "8px",
//           padding: "2px 8px",
//           margin: "0"
//         }}
//       >
//         Chưa xử lý
//       </b>
//     );
//   }
// };

const ActionCellRender: FC<{ data: DanhSachLoiSv; onDeleteItem: any }> = ({ data, onDeleteItem }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <Tooltip title="Xoá">
      <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
    </Tooltip>
  );
};
