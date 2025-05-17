import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Space, Spin, Switch, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import PageContainer from "@/Layout/PageContainer";
import exportApi from "@/api/export/export.api";
import maHocPhanApi from "@/api/maHocPhan/maHocPhan.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { MaHocPhan } from "@/interface/maHocPhan";
import { ColDef } from "ag-grid-community";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EditorDialog from "./editor-dialog";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: false,
  floatingFilter: true
};

const isDoAn = [
  {
    value: "true",
    label: "Đồ án"
  },
  {
    value: "false",
    label: "Khác đồ án"
  }
];

const isDoAnTotNghiep = [
  {
    value: "true",
    label: "Đồ án tốt nghiệp"
  },
  {
    value: "false",
    label: "Khác đồ án tốt nghiệp"
  }
];

const isThucTap = [
  {
    value: "true",
    label: "Thực tập"
  },
  {
    value: "false",
    label: "Khác thực tập"
  }
];

const MaHocPhanPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <MaHocPhanPageDesktop />;
  const contentMobile = () => <MaHocPhanPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default MaHocPhanPage;

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
      <Tooltip title="Chi tiết">
        <Link to={"" + data.id}>
          <Button shape="circle" type="text">
            <i className="fa-solid fa-chevron-right"></i>
          </Button>
        </Link>
      </Tooltip>
    </>
  );
};

const ActionCellRenderDoAn: FC<any> = (data) => {
  return <Switch checked={data.data?.is_do_an} />;
};

const ActionCellRenderDoAnTotNghiep: FC<any> = (data) => {
  return <Switch checked={data.data?.is_do_an_tot_nghiep} />;
};

const ActionCellRenderThucTap: FC<any> = (data) => {
  return <Switch checked={data.data?.is_thuc_tap} />;
};

const MaHocPhanPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("ma-hoc-phan");
  const [data, setData] = useState<MaHocPhan>();
  const [loadingEx, setLoadingEx] = useState(false);

  const [columnDefs] = useState<ColDef<MaHocPhan & ActionField>[]>([
    {
      headerName: t("field.ma"),
      field: "ma",
      sortable: true,
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.ten_hp"),
      field: "ten_hp",
      sortable: true,
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.is_do_an"),
      field: "is_do_an",
      filter: SelectFilter,
      cellRenderer: ActionCellRenderDoAn,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        //   placeholder: "Lớp",
        data: isDoAn
      }
    },
    {
      headerName: t("field.is_do_an_tot_nghiep"),
      field: "is_do_an_tot_nghiep",
      filter: SelectFilter,
      cellRenderer: ActionCellRenderDoAnTotNghiep,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        data: isDoAnTotNghiep
      }
    },
    {
      headerName: t("field.is_thuc_tap"),
      field: "is_thuc_tap",
      filter: SelectFilter,
      cellRenderer: ActionCellRenderThucTap,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        data: isThucTap
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: MaHocPhan) => {
          setData(item);
          setIsEdit(true);
          setModalEditor(true);
        },
        onDeleteItem: (item: MaHocPhan) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false
    }
  ]);
  const handleExport = async () => {
    setLoadingEx(true);
    try {
      await exportApi.exportThongKeMaHocPhan();
    } finally {
      setLoadingEx(false);
    }
  };
  return (
    <>
      <PageContainer
        title="Quản lý mã học phần"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button loading={loadingEx} onClick={handleExport}>
              Xuất danh sách
            </Button>
            <Button onClick={() => setModalEditor(true)} type="primary" style={{ float: "right" }}>
              {t("action.create_new")}
            </Button>
          </Space>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={maHocPhanApi.list}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <EditorDialog
        isEdit={isEdit}
        setEdit={setIsEdit}
        data={data}
        showModal={modalEditor}
        setShowModal={setModalEditor}
        setKeyRender={setKeyRender}
      />
      <DeleteDialog
        openModal={isModalDelete}
        translation="ma-hoc-phan"
        closeModal={setIsModalDelete}
        name={data?.ma}
        apiDelete={() => data && maHocPhanApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

const MaHocPhanPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<MaHocPhan[]>([]);
  const [data, setData] = useState<MaHocPhan>();
  const [isEdit, setIsEdit] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { t } = useTranslation("ma-hoc-phan");

  const [loading, setLoading] = useState<boolean>(false);
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
      const res = await maHocPhanApi.list(filter);
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
    const sendData = {
      filterModel: {
        ma: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_hp
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
        },
        is_do_an: {
          filterType: "text",
          type: "contains",
          filter: filter.is_do_an
        },
        is_do_an_tot_nghiep: {
          filterType: "text",
          type: "contains",
          filter: filter.is_do_an_tot_nghiep
        },
        is_thuc_tap: {
          filterType: "text",
          type: "contains",
          filter: filter.is_thuc_tap
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
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="is_do_an" label="Đồ án">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("is_do_an", value);
              }}
            >
              {isDoAn.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            name="is_do_an_tot_nghiep"
            label="Đồ án tốt nghiệp"
          >
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("is_do_an_tot_nghiep", value);
              }}
            >
              {isDoAnTotNghiep.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="is_thuc_tap" label="Thực tập">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("is_thuc_tap", value);
              }}
            >
              {isThucTap.map((item) => (
                <Select.Option key={item.value}>{item.label}</Select.Option>
              ))}
            </Select>
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
    Content = <div className="p-2 text-center"> Chưa có mã học phần nào</div>;
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
                  <strong>Mã học phần:</strong> {record.ma}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Đồ án:</strong> {<Switch size="small" checked={record.is_do_an} />}
                </p>
                <p className="my-1">
                  <strong>Đồ án tốt nghiệp:</strong> {<Switch size="small" checked={record.is_do_an_tot_nghiep} />}
                </p>
                <p className="my-1">
                  <strong>Thực tập:</strong> {<Switch size="small" checked={record.is_thuc_tap} />}
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
                  <Tooltip title="Xóa">
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
                  <Tooltip title="Chi tiết">
                    <Link to={"" + record.id}>
                      <Button shape="circle" type="text">
                        <i className="fa-solid fa-chevron-right"></i>
                      </Button>
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
        <EditorDialog
          isEdit={isEdit}
          setEdit={setIsEdit}
          data={data}
          showModal={modalEditor}
          setShowModal={setModalEditor}
          setKeyRender={setKeyRender}
        />
        <DeleteDialog
          openModal={isModalDelete}
          translation="ma-hoc-phan"
          closeModal={setIsModalDelete}
          name={data?.ma}
          apiDelete={() => data && maHocPhanApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý mã học phần"
        extraTitle={
          <Space style={{ float: "right" }}>
            <Button onClick={() => setModalEditor(true)} type="primary" style={{ float: "right" }}>
              {t("action.create_new")}
            </Button>
          </Space>
        }
      >
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};
