import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { DateFormat } from "@/components/format/date";
import { CauHoiCellRender } from "@/components/TrangThaiCellRender";
import { PhanBien } from "@/interface/cauHoi";
import { Loading } from "@/pages/Loading";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useParams } from "react-router-dom";

export const CauHoiPhanBien: FC<{
  isTroLy?: boolean;
  onlyMe?: boolean;
  id?: number | string;
}> = ({ isTroLy, id, onlyMe }) => {
  const paramId = useParams();

  const { data: phanBien, isLoading: loading } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["cau-hoi", paramId.id || id, "phan-bien", onlyMe] as const,
    queryFn: ({ queryKey }) => {
      const [, cau_hoi_id, , onlyMe] = queryKey;
      return cauHoiApi.listPhanBien(cau_hoi_id!, { onlyMe }).then((res) => res.data as PhanBien[]);
    }
  });
  if (loading) {
    return (
      <div className="">
        <Loading />
      </div>
    );
  }
  if (!phanBien || phanBien.length < 1) {
    return <div className="p-2 text-center"> Chưa có phản biện nào</div>;
  }
  return phanBien.map((item: any, index: number) => {
    return <PheDuyetItem item={item} key={index} isTroLy={isTroLy} />;
  });
};

const TrangThaiCauHoi = (trang_thai: string) => {
  if (!trang_thai) {
    return <span></span>;
  }
  switch (trang_thai) {
    case "cho_duyet":
      return <span>chờ duyệt</span>;
    case "tu_choi":
      return <span>từ chối</span>;
    case "phe_duyet":
      return <span>phê duyệt</span>;
  }
  return <span>{trang_thai}</span>;
};

const PheDuyetItem: FC<{ item: any; isTroLy?: boolean }> = ({ item, isTroLy }) => {
  return (
    <div className="p-3 flex " style={{ borderBottom: "1px solid #ccc" }}>
      <p className="font-medium inline shrink-0 grow-0 basis-40">
        <DateFormat value={item.ngay_phe_duyet} defaultValue="Chờ duyệt"></DateFormat>
      </p>
      <div className="flex-auto px-2">
        <div>
          <span>
            Câu hỏi{" "}
            {item.trang_thai_cau_hoi == "phe_duyet"
              ? "được"
              : item.trang_thai_cau_hoi == "tu_choi"
                ? "bị"
                : "đang được"}
          </span>{" "}
          {item.trang_thai_cau_hoi !== "cho_duyet" && isTroLy && (
            <>
              <span className="font-semibold" style={{ color: "black" }}>
                {item.giao_vien.name}
              </span>{" "}
            </>
          )}
          <span
            className="font-bold rounded p-0.5 my-0.5"
            style={{
              color:
                item.trang_thai_cau_hoi == "phe_duyet"
                  ? "#09a757"
                  : item.trang_thai_cau_hoi == "tu_choi"
                    ? "#f65f41"
                    : "#2470ff"
            }}
          >
            {TrangThaiCauHoi(item.trang_thai_cau_hoi)}
          </span>{" "}
          {item.trang_thai_cau_hoi == "cho_duyet" && isTroLy && (
            <>
              bởi{" "}
              <span className="font-semibold" style={{ color: "black" }}>
                {item.giao_vien.name}
              </span>{" "}
            </>
          )}
          {`ở lần phê duyệt thứ ${item.lan}`}
        </div>
        {item.ly_do && (
          <div className="flex pt-2 overflow-hidden">
            <strong className="shrink-0 grow-0 basis-12">Lý do:</strong>{" "}
            <div className="flex-auto">
              <CauHoiCellRender data={item.ly_do} className="break-all" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
