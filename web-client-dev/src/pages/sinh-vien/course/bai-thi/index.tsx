import { ThiApiReturn } from "@/api/sinhVien/thi.api";
import { CauHoiBaiThi, CauHoiBaiThiConvert } from "@/interface/cauHoi";
import { FieldId } from "@/interface/common";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Lop } from "@/interface/lop";
import { Col, Row } from "antd";
import { FC, useMemo } from "react";
import { BaiThiQuestion } from "./cau-hoi";
import { BaiThiContainer } from "./context";
import { BaiThiInfo } from "./info";
import { BaiThiInfoUser } from "./info-user";
import { BaiThiMenu } from "./menu";

export const BaiThi: FC<{
  loaiThi: string;
  cauhois: CauHoiBaiThi[];
  chuong: HocPhanChuong;
  baiThiId?: FieldId;
  dataThi: ThiApiReturn;
  onDone: () => void;
  lop?: Lop;
}> = ({ loaiThi, cauhois, chuong, baiThiId, onDone, dataThi, lop }) => {
  const items = useMemo(() => {
    return cauhois.map<CauHoiBaiThiConvert>((item, i) => ({
      id: item.id,
      content: item.noi_dung,
      answers: item.lua_chon.map((answer: any) => ({
        id: answer.id,
        content: answer.content
      })),
      stt: i + 1,
      loai: item.loai
    }));
  }, [cauhois]);
  return (
    <BaiThiContainer
      loaiThi={loaiThi}
      items={items}
      chuong={chuong}
      baiThiId={baiThiId}
      onDone={onDone}
      dataThi={dataThi}
      lop={lop}
    >
      <Row className="mt-5 content-thi">
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
          <BaiThiInfo chuong={chuong} loaiThi={loaiThi}></BaiThiInfo>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12} className="card-cau-hoi-thi">
          <BaiThiQuestion />
        </Col>
        <Col xs={24} sm={24} md={24} lg={6} xl={6} className="flex gap-2 flex-column">
          <BaiThiMenu />
          <BaiThiInfoUser />
        </Col>
      </Row>
    </BaiThiContainer>
  );
};
