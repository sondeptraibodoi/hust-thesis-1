import thuctapApi from "@/api/lop/thuctap.api";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { SinhVienThucTap } from "@/interface/lop";
import { FC, useCallback, useEffect, useState } from "react";

import kiHocApi from "@/api/kiHoc/kiHoc.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { useAppSelector } from "@/stores/hook";
import { EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const DoAnTotNghiepPage: FC<any> = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <DoAnTotNghiepPageDesktop />;
  const contentMobile = () => <DoAnTotNghiepPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
export default DoAnTotNghiepPage;

const DoAnTotNghiepPageDesktop: FC<any> = () => {
  const { t } = useTranslation("do-an-tot-nghiep");
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [data, setData] = useState<SinhVienThucTap>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [keyRender, setKeyRender] = useState(1);
  const [columnDefs, setColumDefs] = useState<ColDef<SinhVienThucTap & ActionField>[]>([]);
  const [kiHoc, setKihoc] = useState<string[]>([]);

  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
  const optionsEdit = [
    {
      type: "input",
      name: "ki_hoc",
      placeholder: t("field.ki_hoc"),
      label: t("field.ki_hoc"),
      readOnly: true
    },
    {
      type: "input",
      name: "ma",
      placeholder: t("field.ma"),
      label: t("field.ma"),
      readOnly: true
    },
    {
      type: "input",
      name: "ma_hp",
      placeholder: t("field.ma_hp"),
      label: t("field.ma_hp"),
      readOnly: true
    },
    {
      type: "input",
      name: "ten_hp",
      placeholder: t("required.ten_hp"),
      label: t("field.ten_hp"),
      readOnly: true
    },
    {
      type: "input",
      name: "mssv",
      placeholder: t("field.mssv"),
      label: t("field.mssv"),
      readOnly: true
    },
    {
      type: "input",
      name: "sinh_vien",
      placeholder: t("field.sinh_vien"),
      label: t("field.sinh_vien"),
      readOnly: true
    },
    {
      type: "input",
      name: "ten_de_tai",
      placeholder: t("field.ten_de_tai"),
      label: t("field.ten_de_tai")
    },
    {
      type: "textarea",
      name: "noi_dung",
      placeholder: t("field.noi_dung"),
      label: t("field.noi_dung")
    },
    {
      type: "textarea",
      name: "cac_moc_quan_trong",
      placeholder: t("field.cac_moc_quan_trong"),
      label: t("field.cac_moc_quan_trong")
    }
  ];
  useEffect(() => {
    const ki_hoc_columns: ColDef = {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilter: true
    };
    if (kiHoc && kiHoc.length > 0) {
      ki_hoc_columns.floatingFilterComponent = SelectFloatingFilterCompoment;
      ki_hoc_columns.floatingFilterComponentParams = {
        suppressFilterButton: true,
        placeholder: "Kì học",
        data: kiHoc.map((x: any) => ({ value: x, label: x })),
        kiHienGio: kiHienGio
      };
    }
    setColumDefs([
      ki_hoc_columns,
      {
        headerName: t("field.ma"),
        field: "ma",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ma_hp"),
        field: "ma_hp",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ten_hp"),
        field: "ten_hp",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.mssv"),
        field: "mssv",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.sinh_vien"),
        field: "sinh_vien",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ten_de_tai"),
        field: "ten_de_tai",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.noi_dung"),
        field: "noi_dung",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.cac_moc_quan_trong"),
        field: "cac_moc_quan_trong",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.action"),
        field: "action",
        pinned: "right",
        width: 150,
        cellRenderer: ActionCellRender,
        cellRendererParams: {
          onEditItem: (item: SinhVienThucTap) => {
            setData(item);
            setIsEdit(true);
            setModalEditor(true);
          }
        },
        filter: false
      }
    ]);
  }, [kiHoc]);
  return (
    <>
      <PageContainer title="Danh sách đồ án tốt nghiệp ">
        <BaseTable
          columns={columnDefs}
          api={thuctapApi.listDoAnTotNghiep}
          gridOption={{ defaultColDef: defaultColDef }}
          key={keyRender}
        ></BaseTable>
        <CreateNEditDialog
          apiCreate={() => {}}
          apiEdit={thuctapApi.editDoAnTotNghiep}
          options={optionsEdit}
          translation={"do-an-tot-nghiep"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={modalEditor}
          closeModal={setModalEditor}
        />
      </PageContainer>
    </>
  );
};
const DoAnTotNghiepPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const { t } = useTranslation("do-an-tot-nghiep");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<SinhVienThucTap[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [data, setData] = useState<SinhVienThucTap>();
  const [modalEditor, setModalEditor] = useState<boolean>(false);
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
  const optionsEdit = [
    {
      type: "input",
      name: "ki_hoc",
      placeholder: t("field.ki_hoc"),
      label: t("field.ki_hoc"),
      readOnly: true
    },
    {
      type: "input",
      name: "ma",
      placeholder: t("field.ma"),
      label: t("field.ma"),
      readOnly: true
    },
    {
      type: "input",
      name: "ma_hp",
      placeholder: t("field.ma_hp"),
      label: t("field.ma_hp"),
      readOnly: true
    },
    {
      type: "input",
      name: "ten_hp",
      placeholder: t("required.ten_hp"),
      label: t("field.ten_hp"),
      readOnly: true
    },
    {
      type: "input",
      name: "mssv",
      placeholder: t("field.mssv"),
      label: t("field.mssv"),
      readOnly: true
    },
    {
      type: "input",
      name: "sinh_vien",
      placeholder: t("field.sinh_vien"),
      label: t("field.sinh_vien"),
      readOnly: true
    },
    {
      type: "input",
      name: "ten_de_tai",
      placeholder: t("field.ten_de_tai"),
      label: t("field.ten_de_tai")
    },
    {
      type: "textarea",
      name: "noi_dung",
      placeholder: t("field.noi_dung"),
      label: t("field.noi_dung")
    },
    {
      type: "textarea",
      name: "cac_moc_quan_trong",
      placeholder: t("field.cac_moc_quan_trong"),
      label: t("field.cac_moc_quan_trong")
    }
  ];

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await thuctapApi.listDoAnTotNghiep(filter);
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
  const onSubmit = (filter?: any) => {
    const sendData: any = {
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
        ma_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_hp
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
        },
        mssv: {
          filterType: "text",
          type: "contains",
          filter: filter.mssv
        },
        sinh_vien: {
          filterType: "text",
          type: "contains",
          filter: filter.sinh_vien
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ten_de_tai) {
      sendData.filterModel.ten_de_tai = {
        filterType: "text",
        type: "contains",
        filter: filter.ten_de_tai
      };
    }
    if (filter.noi_dung) {
      sendData.filterModel.noi_dung = {
        filterType: "text",
        type: "contains",
        filter: filter.noi_dung
      };
    }
    if (filter.cac_moc_quan_trong) {
      sendData.filterModel.cac_moc_quan_trong = {
        filterType: "text",
        type: "contains",
        filter: filter.cac_moc_quan_trong
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
  }, [pagination.itemsPerPage, pagination.page]);
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã lớp">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hp" label="Mã học phần">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_hp", e.target.value);
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
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="mssv" label="Mã sinh viên">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("mssv", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="sinh_vien" label="Tên sinh viên">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("sinh_vien", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_de_tai" label="Tên đề tài">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_de_tai", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="noi_dung" label="Nội dung đề tài">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("noi_dung", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="cac_moc_quan_trong"
            label="Các mốc kiểm soát chính"
          >
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("cac_moc_quan_trong", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có đồ án tốt nghiệp nào</div>;
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
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Mã sinh viên:</strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>Tên sinh viên:</strong> {record.sinh_vien}
                </p>
                <p className="my-1">
                  <strong>Tên đề tài:</strong> {record.ten_de_tai}
                </p>
                <p className="my-1">
                  <strong>Nội dung đề tài:</strong> {record.noi_dung}
                </p>
                <p className="my-1">
                  <strong>Các mốc kiểm soát chính:</strong> {record.cac_moc_quan_trong}
                </p>

                <div className="flex justify-center">
                  <Tooltip title="Sửa">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setData(record);
                        setIsEdit(true);
                        setModalEditor(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Đánh giá">
                    <Link to={`${record.lop_id}/${record.sinh_vien_id}/danh-gia`}>
                      <Button shape="circle" icon={<InfoCircleOutlined />} type="text" />
                    </Link>
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
        <CreateNEditDialog
          apiCreate={() => {}}
          apiEdit={thuctapApi.editDoAnTotNghiep}
          options={optionsEdit}
          translation={"do-an-tot-nghiep"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={modalEditor}
          closeModal={setModalEditor}
        />
      </>
    );
  }

  return (
    <PageContainer title="Danh sách đồ án tốt nghiệp">
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </PageContainer>
  );
};

const ActionCellRender: FC<any> = ({ onEditItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onEditItem(data)} />
      </Tooltip>
      <Tooltip title="Đánh giá">
        <Link to={`${data.lop_id}/${data.sinh_vien_id}/danh-gia`}>
          <Button shape="circle" icon={<InfoCircleOutlined />} type="text" onClick={() => onEditItem(data)} />
        </Link>
      </Tooltip>
    </>
  );
};
