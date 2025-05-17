import thiApi from "@/api/sinhVien/thi.api";
import { LOAI_BAI_THI } from "@/constant";
import { CauHoiBaiThi } from "@/interface/cauHoi";
import { FieldId } from "@/interface/common";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Lop } from "@/interface/lop";
import { Button, Result, Spin } from "antd";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BaiThi } from "./bai-thi";

interface Props {
  loaiThi: string;
  setLoaiThi: (value: string) => void;
  dataChuong: HocPhanChuong;
  apiContext?: any;
  onDone?: () => void;
  noSave?: boolean;
  lop?: Lop;
}

const ThiPage: FC<Props> = ({ loaiThi, setLoaiThi, dataChuong, apiContext, onDone, noSave, lop }) => {
  const [loading, setLoading] = useState(true);
  const [listCauHoiThi, setListCauHoiThi] = useState<CauHoiBaiThi[]>([]);
  const [baiThiId, setBaiThiId] = useState<FieldId>();
  const [countDown, setCountDown] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { id } = useParams<{ id: string }>();
  const [dataThi, setDataThi] = useState<Awaited<ReturnType<typeof thiApi.thi>>["data"]>();
  useEffect(() => {
    window.location.hash = baiThiId ? `baithi=${baiThiId}` : "";
  }, [baiThiId]);
  useEffect(() => {
    const ma_hoc_phan = dataChuong?.ma_hoc_phan;
    const chuong_id = dataChuong?.id;
    const getCauHoiThi = async () => {
      if (dataChuong?.ma_hoc_phan && dataChuong?.id) {
        setLoading(true);
        try {
          const res = await thiApi.thi({
            ma_hoc_phan,
            chuong_id,
            lop_id: id,
            loaiThi: loaiThi,
            noSave
          });
          setDataThi(res.data);
          if (res.data && res.data.items && res.data.items.length > 0) {
            setListCauHoiThi(res.data.items);
          }
          setBaiThiId(res.data.bai_thi_id);
        } catch (error: any) {
          if (error.response?.data?.code) {
            switch (error.response?.data?.code) {
              case "DANG_THI":
                setLoaiThi("");
                setErrorMessage(error.response?.data.message);
                apiContext.error({
                  message: "Thất bại",
                  description: error.response.data.message
                });
                break;
              case "DOI_THOI_GIAN_THI":
                setCountDown(error?.response?.data?.data);
                apiContext.error({
                  message: "Thất bại",
                  description: error.response.data.message
                });
                break;
              case "SHOW_ERROR":
                setErrorMessage(error.response?.data.message);
                apiContext.error({
                  message: "Thất bại",
                  description: error.response.data.message
                });
                break;
              default:
                setLoaiThi("");
                apiContext.error({
                  message: "Thất bại",
                  description: error.response.data.message
                });
                break;
            }
          }
          console.error("Failed:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getCauHoiThi();
  }, [dataChuong?.ma_hoc_phan, dataChuong?.id]);

  if (loading) {
    return (
      <div className="p-2 text-center">
        <Spin />
      </div>
    );
  }
  if (countDown >= 0) {
    return (
      <Result
        status="warning"
        title="Mỗi lượt thi sẽ cách nhau ít nhất 10 phút. Vui lòng đợi để có thể bắt đầu bài thi!"
        subTitle={
          <>
            <p style={{ fontSize: "18px" }}>
              Thời gian còn lại
              <div style={{ color: "#CF1627", fontSize: "40px" }}>{countDown}</div> phút
            </p>
            <Button key="return" type="primary" className="mt-3" danger onClick={() => setLoaiThi("")}>
              Quay lại trang trước
            </Button>
          </>
        }
      />
    );
  }
  if (errorMessage) {
    return (
      <Result
        status="warning"
        title={errorMessage}
        subTitle={
          <>
            <Button key="return" type="primary" className="mt-3" danger onClick={() => setLoaiThi("")}>
              Quay lại trang trước
            </Button>
          </>
        }
      />
    );
  }
  return (
    <BaiThi
      loaiThi={loaiThi}
      chuong={dataChuong}
      cauhois={listCauHoiThi}
      baiThiId={baiThiId}
      dataThi={dataThi!}
      lop={lop}
      onDone={() => {
        setLoaiThi("");
        if (loaiThi == LOAI_BAI_THI.THI_THAT) {
          onDone && onDone();
        }
      }}
    />
  );
};

export default ThiPage;
