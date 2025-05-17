import { Button, Modal, notification } from "antd";
import { CellEditingStoppedEvent, ColDef } from "ag-grid-community";
import { useCallback, useEffect, useState } from "react";

import { AgGridReact } from "ag-grid-react";
import ImportExcelCompoment from "@/components/importDrawer";
import PageContainer from "@/Layout/PageContainer";
import downloadApi from "@/api/download.api";
import nhiemVuCuaToiApi from "@/api/nhiemVu/nhiemVuCuaToi.api";
import { useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";

const defaultColDef = {
  flex: 1,
  minWidth: 200,
  resizable: true,
  editable: false
};
const breadcrumbs = [{ router: "../", text: "Danh sách" }, { text: "Chi tiết" }];
const NhiemVuChiTietPage = () => {
  const [api, contextholder] = notification.useNotification();
  const [diems, setDiems] = useState<any[]>([]);
  const [diemEdit, setDiemEdit] = useState<any[]>([]);
  const nhiemvu = useLoaderData() as any;
  const { t } = useTranslation("phuc-khao");
  const [modalSave, setModalSave] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [columnDefs] = useState<ColDef<any>[]>([
    {
      headerName: "STT",
      field: "stt",
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    {
      headerName: t("field.mssv"),
      field: "mssv",
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    {
      headerName: t("field.name"),
      field: "name",
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    {
      headerName: "Mã học phần",
      field: "ma_hp",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      sortable: true
    },
    {
      headerName: t("field.ma_lop_thi"),
      field: "ma_lop_thi",
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    {
      headerName: "Điểm",
      field: "diem",
      sortable: true
    },
    {
      headerName: "Điểm phúc khảo",
      field: "diem_phuc_khao",
      filter: "agTextColumnFilter",
      editable: true,
      sortable: true
    }
  ]);

  useEffect(() => {
    setDiems(
      nhiemvu.items.map((x: any) => ({
        ...x,
        diem_phuc_khao: x.diem_phuc_khao || x.diem
      }))
    );
    setDiemEdit(
      nhiemvu.items.map((x: any) => ({
        ...x,
        diem_phuc_khao: x.diem_phuc_khao || x.diem,
        change: false
      }))
    );
  }, [nhiemvu]);

  const onCellEditingStopped = useCallback((event: CellEditingStoppedEvent) => {
    setDiemEdit((diems) =>
      diems
        .map((itemA: any) => {
          if (itemA.sinh_vien_id === event.data.sinh_vien_id && itemA.lop_thi_id === event.data.lop_thi_id) {
            return { ...event.data, change: true };
          }
          return itemA;
        })
        .slice()
    );
  }, []);
  const onSaveDiem = useCallback(async () => {
    setLoadingSave(true);
    try {
      await nhiemVuCuaToiApi.update(nhiemvu.id, { diems: diemEdit });
      api.success({
        message: "Thành Công",
        description: "Lưu điểm thành công"
      });
      setModalSave(false);
    } catch (error) {
      api.error({
        message: "Thất bại",
        description: "Lưu điểm thất bại"
      });
    } finally {
      setLoadingSave(false);
    }
  }, [nhiemvu, diemEdit]);
  const getRowStyle = (params: any) => {
    if (params.data.diem != params.data.diem_phuc_khao) {
      return { background: "#ffff0050" };
    }
    return { background: "white" };
  };
  const onExportExcel = useCallback(async () => {
    setLoadingDownload(true);

    try {
      await downloadApi.downloadExcel({
        name: "nhiem_vu",
        title: "data",
        data: diems.map((x) => {
          return {
            ma_hp: x.ma_hp,
            stt: x.stt,
            mssv: x.mssv,
            name: x.name,
            ma_lop_thi: x.ma_lop_thi,
            diem: x.diem,
            diem_phuc_khao: x.diem_phuc_khao
          };
        }),
        headers: [
          { text: "Mã học phần", value: "ma_hp" },
          { text: "STT", value: "stt" },
          { text: "MSSV", value: "mssv" },
          { text: "Tên SV", value: "name" },
          { text: "Mã lớp thi", value: "ma_lop_thi" },
          { text: "Điểm", value: "diem" },
          { text: "Điểm phúc khảo", value: "diem_phuc_khao" }
        ],
        simple: true
      });
      api.success({
        message: "Thành công",
        description: "Tải tập tin thành công"
      });
    } catch (err) {
      api.error({
        message: "Thất bại",
        description: "Tải tập tin thất bại"
      });
    } finally {
      setLoadingDownload(false);
    }
  }, [diems]);
  const uploadformApi = useCallback(
    (data: any) => {
      const items_format = data.items.map((x: any) => {
        const res: any = {};

        for (const property in data.fields) {
          const key_value = data.fields[property];
          res[property] = x[key_value];
        }

        return res;
      });
      setDiems((state) => {
        items_format.forEach((item: any) => {
          const index = state.findIndex((x) => x.ma_lop_thi == item.ma_lop_thi && x.mssv == item.mssv);
          if (index > -1) {
            state[index].diem_phuc_khao = item.diem_phuc_khao || state[index].diem;
          }
        });
        return state.slice();
      });
      setDiemEdit((state) => {
        items_format.forEach((item: any) => {
          const index = state.findIndex((x) => x.ma_lop_thi == item.ma_lop_thi && x.mssv == item.mssv);
          if (index > -1) {
            state[index].diem_phuc_khao = item.diem_phuc_khao || state[index].diem;
            state[index].change = true;
          }
        });
        return state.slice();
      });

      api.success({
        message: "Thành công",
        description: "Vui lòng kiểm tra lại điểm và ấn lưu để lưu dữ liệu điểm phúc khảo"
      });
      return Promise.resolve({});
    },
    [diems]
  );
  return (
    <>
      {contextholder}
      <PageContainer
        title="Chi tiết Nhiệm vụ"
        breadcrumbs={breadcrumbs}
        extraTitle={
          <div style={{ float: "right" }}>
            <Button type="link" loading={loadingDownload} className="mr-2" onClick={() => onExportExcel()}>
              Tải excel mẫu
            </Button>
            <div className="mr-2 d-inline-block">
              <ImportExcelCompoment
                disableNotify
                fieldName={[
                  { name: "mssv", text: "MSSV" },
                  { name: "ma_lop_thi", text: "Mã lớp thi" },
                  { name: "diem_phuc_khao", text: "Điểm phúc khảo" }
                ]}
                uploadType=" .xls,.xlsx"
                buttonElement={<Button type="primary">Nhập điểm excel</Button>}
                appcectType={[
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  "application/vnd.ms-excel"
                ]}
                translation="importExcel"
                uploadformApi={uploadformApi}
                suggestType="nhiem-vu-phuc-khao"
              />
            </div>
            <Button type="primary" onClick={() => setModalSave(true)}>
              Lưu
            </Button>
          </div>
        }
      >
        <AgGridReact
          className="ag-theme-alpine bang_diem_ag"
          rowData={diems}
          defaultColDef={defaultColDef}
          enableCellTextSelection
          columnDefs={columnDefs}
          onCellEditingStopped={onCellEditingStopped}
          getRowStyle={getRowStyle}
        ></AgGridReact>
        <Modal
          open={modalSave}
          onOk={onSaveDiem}
          centered
          onCancel={() => setModalSave(false)}
          footer={
            <div className="flex gap-4">
              <Button block danger onClick={() => setModalSave(false)}>
                Huỷ
              </Button>
              <Button block loading={loadingSave} onClick={onSaveDiem}>
                Xác nhận
              </Button>
            </div>
          }
        >
          <div className="pt-4">
            <h2 className="pb-4 text-center">Lưu điểm</h2>
            <p>
              Bạn muốn lưu dữ liệu bảng điểm hiện tại, hãy chắc chắn mọi dữ liệu đều chính xác trước khi xác nhận lưu.
            </p>
          </div>
        </Modal>
      </PageContainer>
    </>
  );
};
export default NhiemVuChiTietPage;
