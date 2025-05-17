import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Pagination, Row, Spin, Tooltip } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import kiHocApi from "@/api/kiHoc/kiHoc.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Paginate } from "@/interface/axios";
import { ActionField } from "@/interface/common";
import { SinhVien } from "@/interface/user";
import PageContainer from "@/Layout/PageContainer";
import { ColDef } from "ag-grid-community";
import { PaginationProps } from "antd/lib";
import { useTranslation } from "react-i18next";
import CreateNEditDialog from "./modal-add-sv-truot-mon";
const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: false,
  floatingFilter: true
};

const DanhSachTruotMonPage = () => {
  const [keyRender, setKeyRender] = useState(0);

  const contentDesktop = () => <DanhSachTruotMonPageDesktop />;
  const contentMobile = () => <DanhSachTruotMonPageMobile key={keyRender} setKeyRender={setKeyRender} />;
  return (
    <>
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </>
  );
};
const DanhSachTruotMonPageDesktop: FC<any> = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kiHoc, setKihoc] = useState<string[]>([]);

  const [keyRender, setKeyRender] = useState(1);
  const [data, setData] = useState<SinhVien>();
  const [isModalDelete, setIsModalDelete] = useState(false);

  const { t } = useTranslation("sinh-vien-extras");
  const [columnDefs, setColumDefs] = useState<ColDef<SinhVien & ActionField>[]>([]);

  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);

  const options = [
    {
      type: "select",
      name: "ki_hoc",
      label: t("field.ki_hoc"),
      placeholder: t("field.ki_hoc"),
      children: kiHoc.map((x) => {
        return {
          value: x
        };
      }),
      disabled: isEdit ? true : false
    },
    {
      type: "text",
      name: "ma_hp",
      label: t("field.ma_hp"),
      disabled: isEdit ? true : false
    },
    {
      type: "number",
      name: "mssv",
      label: t("field.mssv"),
      disabled: isEdit ? true : false
    },
    {
      type: "textarea",
      name: "note",
      label: t("field.note")
    }
  ];

  useEffect(() => {
    setColumDefs([
      {
        headerName: t("field.mssv"),
        field: "mssv",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.name"),
        field: "name",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ma_lop"),
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
        headerName: t("field.group"),
        field: "group",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.ly_do"),
        field: "note",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.action"),
        field: "action",
        pinned: "right",
        width: 150,
        cellRenderer: ActionCellRender,

        cellRendererParams: {
          onUpdateItem: (item: SinhVien) => {
            setData(item);
            setIsEdit(true);
            setIsModalOpen(true);
          },
          onDeleteItem: (item: SinhVien) => {
            setData(item);
            setIsModalDelete(true);
          }
        },
        filter: false
      }
    ]);
  }, [t]);

  return (
    <>
      <PageContainer
        title="Quản lý sinh viên trượt môn"
        extraTitle={
          <Button onClick={() => setIsModalOpen(true)} type="primary" style={{ float: "right" }}>
            {t("action.create_new")}
          </Button>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={lopHocApi.listSVTruotMon}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
      </PageContainer>
      <CreateNEditDialog
        apiCreate={lopHocApi.addSVTruotMonExtras}
        apiEdit={lopHocApi.updateSVTruotMon}
        options={options}
        translation={"sinh-vien-extras"}
        data={data}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalOpen}
        closeModal={setIsModalOpen}
        // createIdLop={lop.id}
      />

      <DeleteDialog
        openModal={isModalDelete}
        closeModal={setIsModalDelete}
        apiDelete={() =>
          data &&
          lopHocApi.removeSVExtras({
            lop_id: data.id_lop,
            parent_lop_id: (data as any).parent_lop_id,
            sinh_vien_id: data.sv_id
          })
        }
        setKeyRender={setKeyRender}
        translation="sinh-vien-lop"
        name={data?.name}
      />
    </>
  );
};
const DanhSachTruotMonPageMobile: FC<{ setKeyRender: any }> = ({ setKeyRender }) => {
  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [data, setData] = useState<SinhVien>();
  const [isEdit, setIsEdit] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const { t } = useTranslation("sinh-vien-extras");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kiHoc, setKihoc] = useState<string[]>([]);

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
  const options = [
    {
      type: "select",
      name: "ki_hoc",
      label: t("field.ki_hoc"),
      placeholder: t("field.ki_hoc"),
      children: kiHoc.map((x) => {
        return {
          value: x
        };
      }),
      disabled: isEdit ? true : false
    },
    {
      type: "text",
      name: "ma_hp",
      label: t("field.ma_hp"),
      disabled: isEdit ? true : false
    },
    {
      type: "number",
      name: "mssv",
      label: t("field.mssv"),
      disabled: isEdit ? true : false
    },
    {
      type: "textarea",
      name: "note",
      label: t("field.note")
    }
  ];
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);

  const getData = useCallback(async (filter: any) => {
    setLoading(true);
    try {
      const res = await lopHocApi.listSVTruotMon(filter);
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
    if (filter.mssv) {
      sendData.filterModel.mssv = {
        filterType: "text",
        type: "contains",
        filter: filter.mssv
      };
    }
    if (filter.name) {
      sendData.filterModel.name = {
        filterType: "text",
        type: "contains",
        filter: filter.name
      };
    }

    if (filter.group) {
      sendData.filterModel.group = {
        filterType: "text",
        type: "contains",
        filter: filter.group
      };
    }
    if (filter.note) {
      sendData.filterModel.note = {
        filterType: "text",
        type: "contains",
        filter: filter.note
      };
    }
    getData(sendData);
  };

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, [pagination.itemsPerPage, pagination.page]);
  const Filter = (
    <Form form={form} layout="vertical" {...layout} labelWrap onFinish={onSubmit}>
      <Row>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="mssv" label={t("field.mssv")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("mssv", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="name" label={t("field.name")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("name", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label={t("field.ma_lop")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hp" label={t("field.ma_hp")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ma_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_hp" label={t("field.ten_hp")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("ten_hp", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="group" label={t("field.group")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("group", e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
          <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="note" label={t("field.ly_do")}>
            <Input
              onPressEnter={(e: any) => {
                pagination.page = 1;
                handleFieldChanged("note", e.target.value);
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
    Content = <div className="p-2 text-center"> Chưa có sinh viên nào trượt môn</div>;
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
                  <strong>MSSV:</strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>Tên sinh viên:</strong> {record.name}
                </p>
                <p className="my-1">
                  <strong>Mã lớp học:</strong> {record.ma}
                </p>
                <p className="my-1">
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>

                <p className="my-1">
                  <strong>Lớp:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Nhóm:</strong> {record.group}
                </p>
                <p className="my-1">
                  <strong>Lý do:</strong> {record.note}
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
                        setIsModalOpen(true);
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
          apiCreate={lopHocApi.addSVTruotMonExtras}
          apiEdit={lopHocApi.updateSVTruotMon}
          options={options}
          translation={"sinh-vien-extras"}
          data={data}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setKeyRender={setKeyRender}
          openModal={isModalOpen}
          closeModal={setIsModalOpen}
          // createIdLop={lop.id}
        />

        <DeleteDialog
          openModal={isModalDelete}
          closeModal={setIsModalDelete}
          apiDelete={() =>
            data &&
            lopHocApi.removeSVExtras({
              lop_id: data.id_lop,
              parent_lop_id: (data as any).parent_lop_id,
              sinh_vien_id: data.sv_id
            })
          }
          setKeyRender={setKeyRender}
          translation="sinh-vien-lop"
          name={data?.name}
        />
      </>
    );
  }

  return (
    <div>
      <PageContainer
        title="Quản lý sinh viên trượt môn"
        extraTitle={
          <Button onClick={() => setIsModalOpen(true)} type="primary" style={{ float: "right" }}>
            {t("action.create_new")}
          </Button>
        }
      >
        {Filter}
        <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
      </PageContainer>
    </div>
  );
};

export default DanhSachTruotMonPage;

const ActionCellRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if (!data) {
    return <span></span>;
  }

  return (
    <>
      <Tooltip title="Sửa">
        <Button
          shape="circle"
          icon={<EditOutlined />}
          type="text"
          onClick={() => {
            onUpdateItem(data);
          }}
        />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
