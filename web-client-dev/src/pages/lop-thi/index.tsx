import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import EditorDialog from "./editor-dialog";
import { Link } from "react-router-dom";
import { LopThi } from "@/interface/lop";
import PageContainer from "@/Layout/PageContainer";
import { Paginate } from "@/interface/axios";
import { PaginationProps } from "antd/lib";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import lopThiApi from "@/api/lop/lopThi.api";
import { useAppSelector } from "@/stores/hook";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: false,
  floatingFilter: true
};
const LopThiPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <LopThiPageDesktop />;
  const contentMobile = () => <LopThiPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};

export default LopThiPage;

const LopThiPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const { t } = useTranslation("lop-thi");
  const [data, setData] = useState<LopThi>();
  const { getData: getDataKiHoc } = useKiHoc();
  const { format: formatDotThi, getData: getLoaiDotThiData } = useLoaiLopThi();

  const [columnDefs] = useState<ColDef<LopThi & ActionField>[]>([
    {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      floatingFilter: true,
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData: getDataKiHoc
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData: getDataKiHoc
      }
    },
    {
      headerName: t("field.ma_lop_hoc"),
      field: "ma_lop",
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
      headerName: t("field.ma_lop_thi"),
      field: "ma_lop_thi",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.loai"),
      field: "loai",
      filter: SelectFilter,
      floatingFilter: true,
      cellRenderer: loaiCellRenderer,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      cellRendererParams: {
        format: formatDotThi
      },
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Đợt thi",
        getData: getLoaiDotThiData
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Đợt thi",
        getData: getLoaiDotThiData
      }
    },
    {
      headerName: t("field.action"),
      field: "action",
      pinned: "right",
      width: 150,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onUpdateItem: (item: LopThi) => {
          setData(item);
          setIsEdit(true);
          setModalEditor(true);
        },
        onDeleteItem: (item: LopThi) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false
    }
  ]);

  return (
    <>
      <PageContainer
        title="Quản lý lớp thi"
        extraTitle={
          <Button onClick={() => setModalEditor(true)} type="primary" style={{ float: "right" }}>
            {t("action.create_new")}
          </Button>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={lopThiApi.listAgGrid}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      {modalEditor && (
        <EditorDialog
          isEdit={isEdit}
          setEdit={setIsEdit}
          data={data}
          showModal={modalEditor}
          setShowModal={setModalEditor}
          setKeyRender={setKeyRender}
        />
      )}
      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          translation="lop-thi"
          closeModal={setIsModalDelete}
          name={data?.ma_lop_thi}
          apiDelete={() => data && lopThiApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      )}
    </>
  );
};
const LopThiPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<LopThi[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const kiHienGio = useAppSelector((state) => state.config.kiHienGio);
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [data, setData] = useState<LopThi>();
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [form] = Form.useForm();
  const { items: DotThi, format: formatDotThi } = useLoaiLopThi();
  const { t } = useTranslation("lop-thi");

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
      const res = await lopThiApi.listAgGrid(filter);
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
        ma_lop: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop
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
        ma_lop_thi: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_lop_thi
        },
        loai: {
          filterType: "text",
          type: "contains",
          filter: filter.loai
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_lop" label="Mã lớp học">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_lop", e.target.value);
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
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_lop_thi" label="Mã lớp thi">
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_lop_thi", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="loai" label="Đợt thi">
            <Select
              allowClear
              onChange={(value) => {
                pagination.page = 1;
                handleFieldChanged("loai", value);
              }}
            >
              {DotThi.map((item) => (
                <Select.Option key={item.value}>{item.title}</Select.Option>
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
    Content = <div className="p-2 text-center"> Chưa có lớp thi nào</div>;
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
                  <strong>Mã lớp học:</strong> {record.ma_lop}
                </p>
                <p className="my-1">
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Mã lớp thi:</strong> {record.ma_lop_thi}
                </p>
                <p className="my-1">
                  <strong>Đợt thi:</strong> {formatDotThi(record.loai)}
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
                    <Link to={"/sohoa/lop-hoc/" + record.lop_id + "/sinh-vien/" + record.id}>
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
        {modalEditor && (
          <EditorDialog
            isEdit={isEdit}
            setEdit={setIsEdit}
            data={data}
            showModal={modalEditor}
            setShowModal={setModalEditor}
            setKeyRender={setKeyRender}
          />
        )}
        {isModalDelete && (
          <DeleteDialog
            openModal={isModalDelete}
            translation="lop-thi"
            closeModal={setIsModalDelete}
            name={data?.ma_lop_thi}
            apiDelete={() => data && lopThiApi.delete(data)}
            setKeyRender={setKeyRender}
          />
        )}
      </>
    );
  }

  return (
    <PageContainer
      title="Quản lý lớp thi"
      extraTitle={
        <Button onClick={() => setModalEditor(true)} type="primary" style={{ float: "right" }}>
          {t("action.create_new")}
        </Button>
      }
    >
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
        <Link to={"/sohoa/lop-hoc/" + data.lop_id + "/sinh-vien/" + data.id}>
          <Button shape="circle" type="text">
            <i className="fa-solid fa-chevron-right"></i>
          </Button>
        </Link>
      </Tooltip>
    </>
  );
};

export interface LoaiCellRendererParams extends ICellRendererParams {
  format: (value: string) => string;
}
const loaiCellRenderer: FC<LoaiCellRendererParams> = (params) => {
  if (!params.value) {
    return "";
  }
  return params.format(params.value);
};
