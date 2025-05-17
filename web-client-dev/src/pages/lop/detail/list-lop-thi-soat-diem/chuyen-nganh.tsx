import diemLopThiApi from "@/api/bangDiem/diemLopThi.api";
import { Lop, LopThi } from "@/interface/lop";
import DiemNhapExcel from "@/pages/bang-diem/lop-thi-mon/diem-nhap-excel";
import { Button, Spin, notification } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { XacNhanDialog } from "./xac-nhan-dialog";
import ImportExcelCompoment from "@/components/importDrawer";
import downloadApi from "@/api/download.api";
export const LopHocBangDiemChuyeNganh: FC<{
  lop_thi: LopThi;
  lop: Lop;
}> = ({ lop_thi }) => {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [api, contextholder] = notification.useNotification();
  const [modalSave, setModalSave] = useState(false);
  const [diemEdit, setDiemEdit] = useState<
    {
      lop_thi_id: any;
      sinh_vien_id: any;
      diem: any;
      mssv: string;
      edit: boolean;
    }[]
  >([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [diem, setDiem] = useState<{
    diem: {
      lop_thi_id: any;
      sinh_vien_id: any;
      diem: any;
      mssv: string;
    }[];
    has_diem: boolean;
  }>({
    diem: [],
    has_diem: false
  });
  useEffect(() => {
    const getDiem = async () => {
      setLoadingData(true);
      const res = await diemLopThiApi.detail(lop_thi);
      setDiem(res.data[0]);
      setLoadingData(false);
    };
    getDiem();
  }, [lop_thi.id]);
  const luuDiem = async () => {
    // if (!diemEdit || diemEdit.length == 0 || diemEdit.some((x) => !x.diem)) {
    //   api.error({
    //     message: "Thất bại ",
    //     description:
    //       "Bảng điểm vẫn chưa nhập hết, vui lòng nhập toàn bộ dữ liệu trước khi lưu"
    //   });
    //   return;
    // }
    setLoadingSave(true);
    try {
      await diemLopThiApi.luuDiemChuyenNganh(lop_thi.id, {
        diem: diemEdit.filter((x) => x.edit)
      });
      api.success({
        message: "Thành Công",
        description: "Lưu điểm thành công"
      });
      setModalSave(false);
      setDiemEdit([]);
    } catch (error) {
      console.error(error);
      api.error({
        message: "Thất bại ",
        description: "Lưu điểm thất bại"
      });
    } finally {
      setLoadingSave(false);
    }
  };
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
      setDiem((state) => {
        const diem = state.diem;
        items_format.forEach((item: any) => {
          const index = diem.findIndex((x) => x.mssv == item.mssv);
          if (index > -1) {
            diem[index].diem = item.diem;
          }
        });
        state.diem = diem.slice();
        return { ...state };
      });
      setDiemEdit((state) => {
        items_format.forEach((item: any) => {
          const index = state.findIndex((x: any) => x.mssv == item.mssv);
          if (index > -1) {
            (state[index] as any).diem = item.diem;
            (state[index] as any).edit = true;
          } else {
            const tmp: any = diem.diem.find((x: any) => x.mssv == item.mssv);
            if (tmp) {
              tmp.diem = item.diem;
              tmp.edit = true;
              state.push(tmp);
            }
          }
        });
        return state.slice();
      });

      api.success({
        message: "Thành công",
        description: "Vui lòng kiểm tra lại điểm và ấn lưu để lưu dữ liệu điểm"
      });
      return Promise.resolve({});
    },
    [diem]
  );
  const onExportExcel = useCallback(async () => {
    setLoadingDownload(true);

    try {
      await downloadApi.downloadExcel({
        name: `file_mau_${lop_thi.ma}`,
        title: "data",
        data: diem.diem.map((x: any) => {
          return {
            mssv: x.mssv,
            diem: x.diem
          };
        }),
        headers: [
          { text: "MSSV", value: "mssv" },
          { text: "Điểm", value: "diem" }
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
  }, [diem]);
  return loadingData ? (
    <Spin spinning={loadingData} className="w-full"></Spin>
  ) : (
    <div>
      {contextholder}
      <div className="flex justify-end flex-col mb-4">
        <div className="flex items-center gap-4 ml-auto">
          <Button type="link" loading={loadingDownload} className="mr-2" onClick={() => onExportExcel()}>
            Tải excel mẫu
          </Button>
          <div className="mr-2 d-inline-block">
            <ImportExcelCompoment
              disableNotify
              fieldName={[
                { name: "mssv", text: "MSSV" },
                { name: "diem", text: "Điểm" }
              ]}
              uploadType=" .xls,.xlsx"
              buttonElement={<Button type="primary">Nhập điểm excel</Button>}
              appcectType={[
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel"
              ]}
              translation="importExcel"
              uploadformApi={uploadformApi}
              suggestType="nhap-diem"
            />
          </div>
          <Button type="primary" onClick={() => setModalSave(true)}>
            Lưu
          </Button>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <p className="mt-2" style={{ color: "#CF1627" }}>
            <strong>("Điểm nhập dấu - để thể hiện sinh viên không đi thi")</strong>
          </p>
        </div>
      </div>
      <DiemNhapExcel setDiemEdit={setDiemEdit} diemData={diem} />
      <XacNhanDialog
        open={modalSave}
        onOk={luuDiem}
        centered
        loading={loadingSave}
        onCancel={() => setModalSave(false)}
      />
    </div>
  );
};
