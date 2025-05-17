import { Button, Tag, Tooltip } from "antd";
import { FC, useEffect, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseTable from "@/components/base-table";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import PageContainer from "@/Layout/PageContainer";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import { useTranslation } from "react-i18next";
import { troLyThiBu } from "@/interface/thiBu";
import EditDialog from "@/components/editDialog";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import sinhVienApi from "@/api/thiBu/sinhVien.api";
import DeleteDialog from "@/components/dialog/deleteDialog";
import DangKyThiBuPage from "./them_moi_thi_bu";
const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const DanhSachThiBuSVPages = () => {
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

  return (
    <PageContainer title="Danh sách đơn đăng ký thi bù" extraTitle={<DangKyThiBuPage />}>
      <TableDanhSachThiBu kiHoc={kiHoc} />
    </PageContainer>
  );
};
export default DanhSachThiBuSVPages;

const TableDanhSachThiBu: FC<{ kiHoc: string[] }> = ({ kiHoc }) => {
  const { t } = useTranslation("sinh-vien-thi-bu");
  const [columnDefs, setColumDefs] = useState<ColDef<troLyThiBu & ActionField>[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [isDelete, setIsDelete] = useState(false);
  const [data, setData] = useState<troLyThiBu>();
  const [dataUrl, setDataUrl] = useState([]);
  const [itemSv, setItemSv] = useState<troLyThiBu>();
  const [fileChange, setFileChange] = useState<troLyThiBu>();
  const { items: dotThi, format: formatDotThi } = useLoaiLopThi();

  const statusoption = [
    {
      value: "da_duyet",
      label: "Đã duyệt"
    },
    {
      value: "khong_duyet",
      label: "Không duyệt"
    },
    {
      value: "chua_xac_nhan",
      label: "Chưa xác nhận"
    }
  ];
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
      name: "ten_hp",
      placeholder: t("field.ten_hp"),
      label: t("field.ten_hp"),
      disabled: true
    },
    {
      type: "select",
      name: "dot_thi",
      placeholder: t("field.dot_thi"),
      label: t("field.dot_thi"),
      disabled: true,
      children: dotThi
    },
    {
      type: "select",
      name: "trang_thai",
      placeholder: t("field.trang_thai"),
      label: t("field.trang_thai"),
      disabled: true,
      children: [
        { value: "da_duyet", title: "Duyệt" },
        { value: "khong_duyet", title: "Không duyệt" },
        { value: "chua_xac_nhan", title: "Chưa xác nhận" }
      ]
    },
    {
      type: "textarea",
      name: "ly_do",
      placeholder: t("field.ly_do"),
      label: t("field.ly_do")
    },
    {
      type: "textarea",
      name: "phan_hoi",
      placeholder: t("field.phan_hoi"),
      label: t("field.phan_hoi"),
      disabled: true
    },
    {
      type: "dragger",
      name: "image_urls",
      placeholder: "Chọn ảnh",
      label: "Chọn ảnh",
      url: dataUrl
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
        placeholder: t("field.ki_hoc"),
        data: kiHoc.map((x: any) => ({ value: x, label: x }))
      };
    }

    const loai_columns: ColDef = {
      headerName: t("field.dot_thi"),
      field: "dot_thi",
      filter: SelectFilter,
      floatingFilter: true,
      cellRenderer: loaiCellRenderer
    };

    if (dotThi && dotThi.length > 0) {
      loai_columns.floatingFilterComponent = SelectFloatingFilterCompoment;
      loai_columns.floatingFilterComponentParams = {
        suppressFilterButton: true,
        placeholder: "Đợt thi",
        data: dotThi
          .filter((x) => x.value.startsWith("GK"))
          .map((x) => ({
            label: x.title,
            value: x.value
          }))
      };
      loai_columns.cellRendererParams = {
        format: formatDotThi
      };
    }

    setColumDefs([
      ki_hoc_columns,
      {
        headerName: t("field.ten_hp"),
        field: "ten_hp",
        filter: "agTextColumnFilter"
      },

      loai_columns,
      {
        headerName: t("field.ly_do"),
        field: "ly_do",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.phan_hoi"),
        field: "phan_hoi",
        filter: "agTextColumnFilter"
      },
      {
        headerName: t("field.trang_thai"),
        field: "trang_thai",
        filter: SelectFilter,
        floatingFilter: true,
        floatingFilterComponent: SelectFloatingFilterCompoment,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
          placeholder: t("field.trang_thai"),
          data: statusoption
        },
        cellRenderer: (params: any) => {
          if (!params.value) {
            return <span></span>;
          }
          return params.value === "da_duyet" ? (
            <Tag color="success">Đã duyệt</Tag>
          ) : params.value === "khong_duyet" ? (
            <Tag color="error">Không duyệt</Tag>
          ) : (
            <Tag>Chưa xác nhận</Tag>
          );
        }
      },
      {
        headerName: t("field.action"),
        field: "action",
        width: 200,
        cellRenderer: ActionCellRender,
        cellRendererParams: {
          onUpdateStatus: async (item: any) => {
            const detail = await sinhVienApi.detail(item);
            setData(detail.data);
            setDataUrl(detail.data?.image_urls);
            setIsEdit(true);
            setItemSv(item);
          },
          onDeleteItem: (item: any) => {
            setData(item);
            setIsDelete(true);
          }
        },
        filter: false
      }
    ]);
  }, [kiHoc, t, dotThi]);
  useEffect(() => {
    const UpdateStatus = async (itemSv: any) => {
      const detail = await sinhVienApi.detail(itemSv);
      setDataUrl(detail.data?.image_urls);
    };
    UpdateStatus(itemSv);
  }, [fileChange]);
  return (
    <>
      <BaseTable
        key={keyRender}
        columns={columnDefs}
        api={sinhVienApi.list}
        gridOption={{ defaultColDef: defaultColDef }}
      ></BaseTable>
      <EditDialog
        apiEdit={sinhVienApi.put}
        openModal={isEdit}
        closeModal={setIsEdit}
        setKeyRender={setKeyRender}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        translation="sinh-vien-thi-bu"
        options={optionsEdit}
        data={data}
        btnEdit="Sửa"
        apiAddImage={sinhVienApi.addImage}
        setDataUrl={setDataUrl}
        setFileChange={setFileChange}
        itemSv={itemSv}
        // apiAddImage = {() => data && sinhVienApi.addImage(data.id)}
        apiDeleteImage={(image_id: any) => data && sinhVienApi.deleteImage(data.id, image_id)}
      />
      <DeleteDialog
        openModal={isDelete}
        translation="sinh-vien-thi-bu"
        closeModal={setIsDelete}
        name={data?.ten_hp}
        apiDelete={() => data && sinhVienApi.delete(data.id)}
        setKeyRender={setKeyRender}
      />
    </>
  );
};
const ActionCellRender: FC<{
  data: troLyThiBu;
  onUpdateStatus: any;
  onDeleteItem: any;
}> = ({ data, onUpdateStatus, onDeleteItem }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateStatus(data)}></Button>
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
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
  // return params.format(params?.value);
  return params.value === "GK"
    ? "Giữa kỳ"
    : params.value === "GK2"
      ? "Giữa kỳ 2"
      : params.value === "CK"
        ? "Cuối kỳ"
        : "";
};
