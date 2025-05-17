import baoLoiCuaSv from "@/api/user/baoLoiCuaSv.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { getPrefix } from "@/constant";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { PhucKhao } from "@/interface/phucKhao";
import PageContainer from "@/Layout/PageContainer";
import { getKiHienGio } from "@/stores/features/config";
import { DeleteOutlined, EditOutlined, FormOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, DatePicker, Form, Input, Pagination, Row, Select, Spin, Tag, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
// import phucKhaoAdmin from "@/api/phucKhao/phucKhaoAdmin.api";
import phucKhaoSinhVienApi from "@/api/phucKhao/phucKhaoSinhVien.api";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useAppSelector } from "@/stores/hook";
import { formatDate } from "@/utils/formatDate";
// import PhucKhaoBaoLoiDialog from "./sv-phuc-khao-bao-loi";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const PhucKhaoPages = () => {
  const { items: kiHoc } = useKiHoc();
  const kiHienGio = useAppSelector(getKiHienGio);

  const contentDesktop = () => kiHienGio && <PhucKhaoPagesDesktop kiHoc={kiHoc} kiHienGio={kiHienGio} />;
  const contentMobile = () => kiHienGio && <PhucKhaoPagesMobile kiHoc={kiHoc} kiHienGio={kiHienGio} />;
  return (
    <>
      <PageContainer title="Danh sách phúc khảo">
        <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
      </PageContainer>
    </>
  );
};

export default PhucKhaoPages;

const PhucKhaoPagesDesktop: FC<{ kiHoc: string[]; kiHienGio: string }> = ({ kiHienGio }) => {
  const { t } = useTranslation("phuc-khao");
  const [data, setData] = useState<PhucKhao>();
  const { getData } = useKiHoc();
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [columnDefs] = useState<ColDef<PhucKhao & ActionField>[]>([
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
      headerName: t("field.mssv"),
      field: "mssv",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_lop"),
      field: "ma_lop",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_lop_thi"),
      field: "ma_lop_thi",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ma_thanh_toan"),
      field: "ma_thanh_toan",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ngay_ket_thuc_phuc_khao"),
      field: "ngay_ket_thuc_phuc_khao",
      filter: "agDateColumnFilter",
      cellRenderer: CellHanPhucKhao
    },
    {
      headerName: t("field.trang_thai"),
      field: "trang_thai",
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      cellRenderer: TrangThaiPhucKhaoStatusCellRender,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Trạng thái",
        data: statusoption
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: PhucKhao) => {
          setData(item);
          setIsModalEdit(true);
          setIsEdit(true);
        },
        onDeleteItem: (item: PhucKhao) => {
          setData(item);
          setIsModalDelete(true);
          // setKeyRender(Math.random());
        }
      }
    }
  ]);

  const optionsEdit = [
    {
      type: "input",
      name: "ki_hoc",
      placeholder: t("field.ki_hoc"),
      label: t("field.ki_hoc"),
      disabled: true
    },
    {
      type: "input",
      name: "ma_lop",
      placeholder: t("field.ma_lop"),
      label: t("field.ma_lop"),
      disabled: true
    },
    {
      type: "input",
      name: "ma_lop_thi",
      placeholder: t("field.ma_lop_thi"),
      label: t("field.ma_lop_thi"),
      disabled: true
    },
    {
      type: "select",
      name: "loai",
      placeholder: t("required.loai"),
      label: t("field.loai"),
      children: [
        { title: "Giữa kì", value: "GK" },
        { title: "Giữa kì 2", value: "GK2" },
        { title: "Cuối kì", value: "CK" }
      ],
      disabled: true
    },
    {
      type: "input",
      name: "so_tai_khoan",
      placeholder: t("field.stk"),
      label: t("field.stk")
    },
    {
      type: "textarea",
      name: "tieu_de",
      placeholder: t("field.tieu_de"),
      label: t("field.tieu_de")
    }
    // {
    //   type: "select",
    //   name: "trang_thai",
    //   placeholder: t("required.trang_thai"),
    //   label: t("hint.trang_thai"),
    //   children: [
    //     { value: 1, title: "Đã xử lý" },
    //     { value: 0, title: "Chưa xử lý" }
    //   ],
    //   disabled: true
    // }
  ];
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
        api={phucKhaoSinhVienApi.list}
        key={keyRender}
        gridOption={{ defaultColDef: defaultColDef }}
        initFilter={initFilter}
      ></BaseTable>
      {/* <EditDialog
        apiEdit={phucKhaoSinhVienApi.list}
        options={optionsEdit}
        translation={"bao-loi-sinh-vien"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        closeModal={setIsModalEdit}
      /> */}
      <CreateNEditDialog
        apiCreate={baoLoiCuaSv.create}
        apiEdit={baoLoiCuaSv.baoLoiPhucKhao}
        options={optionsEdit}
        translation={"bao-loi-sinh-vien"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalEdit}
        closeModal={setIsModalEdit}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="phuc-khao"
        closeModal={setIsModalDelete}
        name={"Đơn phúc khảo"}
        subtitle=". Khoản tiền phúc khảo nếu đã thanh toán sẽ không được hoàn trả."
        setKeyRender={setKeyRender}
        apiDelete={() => {
          return data && phucKhaoSinhVienApi.delete(data);
        }}
      />
    </>
  );
};

const PhucKhaoPagesMobile: FC<{
  kiHoc: string[];
  kiHienGio: string;
}> = ({ kiHoc, kiHienGio }) => {
  const [dataSource, setDataSource] = useState<PhucKhao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<PhucKhao>();
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("phuc-khao");
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  };

  const optionsEdit = [
    {
      type: "input",
      name: "ki_hoc",
      placeholder: t("field.ki_hoc"),
      label: t("field.ki_hoc"),
      disabled: true
    },
    {
      type: "input",
      name: "ma_lop",
      placeholder: t("field.ma_lop"),
      label: t("field.ma_lop"),
      disabled: true
    },
    {
      type: "input",
      name: "ma_lop_thi",
      placeholder: t("field.ma_lop_thi"),
      label: t("field.ma_lop_thi"),
      disabled: true
    },
    {
      type: "select",
      name: "loai",
      placeholder: t("required.loai"),
      label: t("field.loai"),
      children: [
        { title: "Giữa kì", value: "GK" },
        { title: "Giữa kì 2", value: "GK2" },
        { title: "Cuối kì", value: "CK" }
      ],
      disabled: true
    },
    {
      type: "input",
      name: "so_tai_khoan",
      placeholder: t("field.stk"),
      label: t("field.stk")
    },
    {
      type: "textarea",
      name: "tieu_de",
      placeholder: t("field.tieu_de"),
      label: t("field.tieu_de")
    }
    // {
    //   type: "select",
    //   name: "trang_thai",
    //   placeholder: t("required.trang_thai"),
    //   label: t("hint.trang_thai"),
    //   children: [
    //     { value: 1, title: "Đã xử lý" },
    //     { value: 0, title: "Chưa xử lý" }
    //   ],
    //   disabled: true
    // }
  ];

  const getData = useCallback(
    async (filter: any) => {
      setLoading(true);
      try {
        const res = await phucKhaoSinhVienApi.list(filter);
        setDataSource(res.data.list || []);
        setPagination((state) => {
          return {
            ...state,
            total: res.data.pagination.total
          };
        });
      } finally {
        setLoading(false);
      }
    },
    [keyRender]
  );
  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1
  });
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
    const sendData: any = {
      filterModel: {
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        },
        ma_lop: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop
        },
        ma_lop_thi: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop_thi
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ngay_ket_thuc_phuc_khao) {
      sendData.filterModel.ngay_ket_thuc_phuc_khao = {
        dateFrom: filter.ngay_ket_thuc_phuc_khao,
        dateTo: null,
        filterType: "date",
        type: "equals"
      };
    }
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_lop" label="Mã lớp học">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_lop_thi" label="Mã lớp thi">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="ngay_ket_thuc_phuc_khao"
            label="Hạn phúc khảo (Đến hết ngày)"
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="DD-MM-YYYY"
              onChange={(date) => {
                pagination.page = 1;
                handleFieldChanged("ngay_ket_thuc_phuc_khao", date);
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
    Content = <div className="p-2 text-center"> Sinh viên chưa gửi phúc khảo nào</div>;
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
                  <strong>{t("field.ki_hoc")}:</strong> {record.ki_hoc}
                </p>
                <p className="my-1">
                  <strong>{t("field.ma_lop")}:</strong> {record.ma_lop}
                </p>
                <p className="my-1">
                  <strong>{t("field.ma_lop_thi")}:</strong> {record.ma_lop_thi}
                </p>
                <p className="my-1">
                  <strong>{t("field.ngay_ket_thuc_phuc_khao")}:</strong> {formatDate(record?.ngay_ket_thuc_phuc_khao)}
                </p>
                <p className="my-1">
                  <strong>{t("field.ma_thanh_toan")}:</strong> {record.ma_thanh_toan}
                </p>
                <p className="my-1">
                  <strong>{t("field.trang_thai")}:</strong>{" "}
                  {record.trang_thai == "da_thanh_toan" ? "Đã thanh toán" : "Chưa thanh toán"}
                </p>
                <div className="flex justify-center">
                  <>
                    <Link to={getPrefix() + "/qr-code/" + record.id}>
                      <Button shape="circle" icon={<EditOutlined />} type="text" />
                    </Link>
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => {
                        setData(record);
                        setIsModalDelete(true);
                      }}
                    />
                    <Tooltip title="Báo lỗi">
                      <Button
                        shape="circle"
                        icon={<FormOutlined />}
                        type="text"
                        onClick={() => {
                          setData(record);
                          setIsModalEdit(true);
                          setIsEdit(true);
                        }}
                      />
                    </Tooltip>
                  </>
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
          translation="phuc-khao"
          closeModal={setIsModalDelete}
          name={"Đơn phúc khảo"}
          apiDelete={() => data && phucKhaoSinhVienApi.delete(data)}
          setKeyRender={setKeyRender}
        />
        <CreateNEditDialog
          apiCreate={baoLoiCuaSv.create}
          apiEdit={baoLoiCuaSv.baoLoiPhucKhao}
          options={optionsEdit}
          translation={"bao-loi-sinh-vien"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalEdit}
          closeModal={setIsModalEdit}
        />
      </div>
    </div>
  );
};

const statusoption = [
  {
    value: "da_thanh_toan",
    label: "Đã thanh toán"
  },
  {
    value: "chua_thanh_toan",
    label: "Chưa thanh toán"
  },
  {
    value: "qua_hạn",
    label: "Quá hạn"
  }
];

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Link to={getPrefix() + "/qr-code/" + data.id}>
        <Tooltip title="Chỉnh sửa">
          <Button shape="circle" icon={<EditOutlined />} type="text" />
        </Tooltip>
      </Link>

      <Tooltip title="Xóa">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>

      <Tooltip title="Báo lỗi">
        <Button
          shape="circle"
          icon={<FormOutlined />}
          type="text"
          onClick={() => {
            onUpdateItem(data);
          }}
        />
      </Tooltip>
    </>
  );
};

export const TrangThaiPhucKhaoStatusCellRender: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  if (data.trang_thai === "qua_han") {
    return (
      <Tag key="0" color="red">
        Quá hạn
      </Tag>
    );
  }
  return (
    <>
      {data.trang_thai == "da_thanh_toan" ? (
        <Tag key="1" color="success">
          Đã thanh toán
        </Tag>
      ) : (
        <Tag key="0" color="red">
          Chưa thanh toán
        </Tag>
      )}
    </>
  );
};

const CellHanPhucKhao: FC<any> = ({ data }) => {
  if (!data || !data.ngay_ket_thuc_phuc_khao) {
    return <span></span>;
  }
  return formatDate(data.ngay_ket_thuc_phuc_khao);
};
