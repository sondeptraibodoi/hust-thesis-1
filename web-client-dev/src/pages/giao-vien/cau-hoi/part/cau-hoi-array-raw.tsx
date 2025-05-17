import { HocPhanCauHoi } from "@/interface/cauHoi";
import { Card } from "antd";
import { FC } from "react";
import { CauHoiViewComplex } from "./cau-hoi-view-complex";
import { DoKhoCellRender } from "@/components/TrangThaiCellRender";

export const CauHoiArrayView: FC<{
  cauHoiArray?: Partial<HocPhanCauHoi>[];
  readonly?: boolean;
}> = ({ cauHoiArray = [] }) => {
  return (
    <>
      <div className="text-lg font-medium mb-4">Tổng số câu hỏi: {cauHoiArray.length}</div>
      {cauHoiArray.map((cauHoi, index) => (
        <Card key={index} style={{ marginBottom: "16px" }} className="cau-hoi-view-array">
          {cauHoi.noi_dung && (
            <div className="text-lg font-medium">
              {" "}
              Câu {index + 1}: {(cauHoi as any).do_kho && <DoKhoCellRender data={(cauHoi as any).do_kho} />}
            </div>
          )}
          <CauHoiViewComplex cauHoi={cauHoi as HocPhanCauHoi} />
        </Card>
      ))}
    </>
  );
};
