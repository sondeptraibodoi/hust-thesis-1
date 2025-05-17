import BaseResponsive from "@/components/base-responsive";
import { ActionField } from "@/interface/common";
import { LopDiemList } from "@/interface/lop";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { DeleteOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Card, Col, Form, Row, Select, Tooltip } from "antd";
import { FC, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import lopDiemApi from "@/api/lop/lopDiem.api";
import PageContainer from "@/Layout/PageContainer";
import BaseTable from "@/components/base-table";
import BaseTableMobile from "@/components/base-table-mobile";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useAppSelector } from "@/stores/hook";
import { getKiHienGio } from "@/stores/features/config";

const DanhSachLopDiemPage: FC<any> = () => {
  const kiHienGio = useAppSelector(getKiHienGio);
  const contentDesktop = () => kiHienGio && <PageDesktop kiHienGio={kiHienGio} />;
  const contentMobile = () => kiHienGio && <PageMobile kiHienGio={kiHienGio} />;
  return (
    <PageContainer title="Quản lý điểm">
      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
    </PageContainer>
  );
};
export default DanhSachLopDiemPage;

const PageDesktop: FC<{ kiHienGio: string }> = ({ kiHienGio }) => {
  const { getData } = useKiHoc();
  const { t } = useTranslation(["lop-hoc-diem", "common"]);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [data, setData] = useState<LopDiemList>();
  const [columnDefs] = useState<ColDef<LopDiemList & ActionField>[]>([
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
      headerName: t("field.ma_lop"),
      field: "ma_lop",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.ma_hp"),
      field: "ma_hp",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.ten_hp"),
      field: "ten_hp",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.mssv"),
      field: "mssv",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.diem"),
      field: "diem",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.loai"),
      field: "loai",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.action", { ns: "common" }),
      field: "action",
      pinned: "right",
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onDeleteItem: (item: LopDiemList) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      filter: false
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
      <BaseTable columns={columnDefs} api={lopDiemApi.list} initFilter={initFilter}></BaseTable>
      <DeleteDialog
        openModal={isModalDelete}
        translation="lop-hoc-diem"
        closeModal={setIsModalDelete}
        name={""}
        apiDelete={() => data && lopDiemApi.delete(data)}
      />
    </>
  );
};
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};
const PageMobile: FC<{ kiHienGio: string }> = ({ kiHienGio }) => {
  const { t } = useTranslation(["lop-hoc-diem", "common"]);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [data, setData] = useState<LopDiemList>();
  const [form] = Form.useForm();
  const [filter, setFilter] = useState({
    filterModel: {
      ki_hoc: {
        filterType: "text",
        type: "contains",
        filter: kiHienGio
      }
    }
  });
  const onSubmit = useCallback((filter?: any) => {
    const sendData: any = {
      filterModel: {
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        }
      }
    };
    setFilter(sendData);
  }, []);
  const handleFieldChanged = (field: string, value: any) => {
    form.setFieldsValue({ [field]: value });
  };
  const { items: kiHoc } = useKiHoc();
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        {...layout}
        labelWrap
        initialValues={{
          ki_hoc: kiHienGio
        }}
        onFinish={onSubmit}
      >
        <Row>
          <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
            <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ki_hoc" label="Kì học">
              <Select
                allowClear
                onChange={(value) => {
                  handleFieldChanged("ki_hoc", value);
                }}
              >
                {kiHoc.map((item) => (
                  <Select.Option key={item}>{item}</Select.Option>
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
      <BaseTableMobile
        api={lopDiemApi.list}
        filter={filter}
        textNodata="Chưa có điểm nào"
        item={(record) => {
          return (
            <Col span={24} key={record.id} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>{t("field.ma_lop")}:</strong> {record.ma_lop}
                </p>
                <p className="my-1">
                  <strong>{t("field.ma_hp")}:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>{t("field.ten_hp")}:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>{t("field.mssv")}:</strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>{t("field.diem")}:</strong> {record.diem}
                </p>
                <p className="my-1">
                  <strong>{t("field.loai")}:</strong> {record.loai}
                </p>
                <div className="flex justify-center">
                  <ActionCellRender
                    data={record}
                    onDeleteItem={(item: LopDiemList) => {
                      setData(item);
                      setIsModalDelete(true);
                    }}
                  />
                </div>
              </Card>
            </Col>
          );
        }}
      ></BaseTableMobile>
      <DeleteDialog
        openModal={isModalDelete}
        translation="lop-hoc-diem"
        closeModal={setIsModalDelete}
        name={""}
        apiDelete={() => data && lopDiemApi.delete(data)}
      />
    </>
  );
};
const ActionCellRender: FC<any> = ({ onDeleteItem, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
