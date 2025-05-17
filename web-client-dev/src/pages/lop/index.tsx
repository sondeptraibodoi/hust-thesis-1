import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Switch, Tag, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import PageContainer from "@/Layout/PageContainer";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import giaoVienApi from "@/api/user/giaoVien.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import filterAggridComponent from "@/components/custom-filter/filterAggridComponent";
import selectFilterGiaoVien from "@/components/custom-filter/selectFilterGiaoVien";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { GiaoVien } from "@/interface/giaoVien";
import { Lop } from "@/interface/lop";
import { useAppSelector } from "@/stores/hook";
import { ColDef } from "ag-grid-community";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EditorDialog from "./editor-dialog";
import { LoaiLopThi, LoaiLopThi_List } from "@/constant";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: false,
  floatingFilter: true
};
const defaultParams = {
  with: "giaoViens"
};

const isDaiCuong = [
  {
    value: "true",
    label: "Lớp đại cương"
  },
  {
    value: "false",
    label: "Lớp chuyên ngành"
  }
];
const loaiThi = LoaiLopThi_List;

const LopHocPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <LopHocPageDesktop />;
  const contentMobile = () => <LopHocPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default LopHocPage;

const LopHocPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("lop");
  const [data, setData] = useState<Lop>();
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [giaoVien, setGiaoVien] = useState<GiaoVien[]>([]);

  const [columnDefs, setColumDefs] = useState<ColDef<Lop & ActionField>[]>([]);
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
        data: kiHoc.map((x) => ({
          label: x,
          value: x
        }))
      };
    }
    const giao_vien_column: ColDef = {
      headerName: t("field.giao_vien"),
      field: "giaoViens",
      floatingFilter: true,
      filter: filterAggridComponent,
      cellRenderer: renderGiaoVien
    };
    if (giaoVien && giaoVien.length > 0) {
      (giao_vien_column.floatingFilterComponent = selectFilterGiaoVien),
        (giao_vien_column.floatingFilterComponentParams = {
          suppressFilterButton: true,
          placeholder: "Giảng viên",
          data: giaoVien.map((x) => ({
            name: x.name,
            id: x.id,
            email: x.email
          }))
        });
    }
    setColumDefs([
      ki_hoc_columns,
      {
        headerName: t("field.ma"),
        field: "ma",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ma_kem"),
        field: "ma_kem",
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
      giao_vien_column,
      {
        headerName: t("field.loai"),
        field: "loai",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.loai_thi"),
        field: "loai_thi",
        filter: SelectFilter,
        cellRenderer: (data: any) => loaiThiCellRender({ data: data?.data?.loai_thi }),
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: "Loại thi",
          data: loaiThi
        }
      },
      {
        headerName: t("field.tuan_hoc"),
        field: "tuan_hoc",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.is_dai_cuong"),
        field: "is_dai_cuong",
        filter: SelectFilter,
        cellRenderer: ActionCellRenderDaiCuong,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: "Lớp",
          data: isDaiCuong
        }
      },
      {
        headerName: t("field.action"),
        field: "action",
        pinned: "right",
        width: 150,
        cellRenderer: ActionCellRender,
        cellRendererParams: {
          onUpdateItem: (item: Lop) => {
            setData(item);
            setIsEdit(true);
            setModalEditor(true);
          },
          onDeleteItem: (item: Lop) => {
            setData(item);
            setIsModalDelete(true);
          }
        },
        filter: false
      }
    ]);
  }, [kiHoc, giaoVien, t]);
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    const getGiaoVien = async () => {
      const res = await giaoVienApi.cache();
      if (res.data && res.data.length > 0) {
        setGiaoVien(res.data);
      }
    };
    getGiaoVien();
    getKyHoc();
  }, []);

  return (
    <>
      <PageContainer
        title="Quản lý lớp học"
        extraTitle={
          <Button onClick={() => setModalEditor(true)} type="primary" style={{ float: "right" }}>
            {t("action.create_new")}
          </Button>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={lopHocApi.list}
          key={keyRender}
          defaultParams={defaultParams}
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
        translation="lop"
        closeModal={setIsModalDelete}
        name={data?.ma}
        apiDelete={() => data && lopHocApi.delete(data)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};

const LopHocPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<Lop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [data, setData] = useState<Lop>();
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [giaoVien, setGiaoVien] = useState<GiaoVien[]>([]);
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
  const isDaiCuong = [
    {
      value: "true",
      label: "Lớp đại cương"
    },
    {
      value: "false",
      label: "Lớp chuyên ngành"
    }
  ];

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await lopHocApi.list({ ...filter, with: "giaoViens" });
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
        }
      },
      count: 1,
      hasMoreItems: true,
      itemsPerPage: pagination.itemsPerPage,
      page: pagination.page,
      total: 1,
      totalPage: 1
    };
    if (filter.ma_kem) {
      sendData.filterModel.ma_kem = {
        filterType: "text",
        type: "contains",
        filter: filter.ma_kem
      };
    }
    if (filter.giaoViens) {
      sendData.filterModel.giaoViens = {
        filterType: "relationship",
        type: "contains",
        relationship: "giaoViens",
        filter: filter.giaoViens
      };
    }
    if (filter.is_dai_cuong) {
      sendData.filterModel.is_dai_cuong = {
        filterType: "text",
        type: "contains",
        filter: filter.is_dai_cuong
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
    const getGiaoVien = async () => {
      const res = await giaoVienApi.cache();
      if (res.data && res.data.length > 0) {
        setGiaoVien(res.data);
      }
    };
    getGiaoVien();
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_kem" label="Mã lớp kèm ">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_kem", e.target.value);
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="giaoViens" label="Giảng viên">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("giaoViens", value);
              }}
            >
              {giaoVien.map((item) => (
                <Select.Option key={item.id}>{`${item.name} - ${item.email}`}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="is_dai_cuong" label="Đại cương">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("is_dai_cuong", value);
              }}
            >
              {isDaiCuong.map((item) => (
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
    Content = <div className="p-2 text-center"> Chưa có lớp học nào</div>;
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
                  <strong>Mã lớp kèm:</strong> {record.ma_kem}
                </p>
                <p className="my-1">
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Giảng viên:</strong>{" "}
                  {record.giao_viens?.length > 0
                    ? record.giao_viens.map((item: any, key: number) => {
                        if (key == record.giao_viens.length - 1 || record.giao_viens.length == 1) {
                          return item.name;
                        }
                        return `${item.name}, `;
                      })
                    : ""}
                </p>
                <p className="my-1">
                  <strong>Loại:</strong> {record.loai}
                </p>
                <p className="my-1">
                  <strong>Tuần học:</strong> {record.tuan_hoc}
                </p>
                <p className="my-1">
                  <strong>Đại cương:</strong> {<Switch size="small" checked={record.is_dai_cuong} />}
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
          translation="lop"
          closeModal={setIsModalDelete}
          name={data?.ma}
          apiDelete={() => data && lopHocApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      </>
    );
  }

  return (
    <PageContainer title="Quản lý lớp học">
      {Filter}
      <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
    </PageContainer>
  );
};

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
const renderGiaoVien: FC<any> = ({ data }) => {
  if (!data) return <></>;
  if (!data.giao_viens) return <></>;
  return <>{data.giao_viens?.map((item: GiaoVien) => <Tag key={item.id}>{item.name}</Tag>)}</>;
};
const ActionCellRenderDaiCuong: FC<any> = (data) => {
  return <Switch checked={data.data?.is_dai_cuong} />;
};
const loaiThiCellRender: FC<any> = ({ data }) => {
  if (!data) return <></>;
  switch (data) {
    case LoaiLopThi.Thi_2_GK:
      return <p>Thi 2 lần giữa kì</p>;
    case LoaiLopThi.Thi_1_GK:
      return <p>Thi 1 lần giữa kì</p>;
    case LoaiLopThi.Thi_GK_30:
      return <p>Thi 1 lần điểm 30</p>;
    case LoaiLopThi.Thi_Theo_Chuong:
      return <p>Thi theo chủ đề</p>;
  }
};
