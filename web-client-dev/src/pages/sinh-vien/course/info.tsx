import { Col, Descriptions, Row } from "antd";

import { ChuongCellRender } from "@/components/TrangThaiCellRender";
import { FC } from "react";
import { HocPhanChuong } from "@/interface/hoc-phan";

const Info: FC<{ chuong: HocPhanChuong }> = ({ chuong }) => {
  return (
    <div className="detail-chapter">
      <div className="chapter-name mb-4" style={{ fontSize: "24px", fontWeight: "600" }}>
        <ChuongCellRender ten={chuong.ten} stt={chuong.stt}></ChuongCellRender>
      </div>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Mã học phần" labelStyle={{ width: "150px" }} style={{ fontSize: "16px" }}>
          {chuong.ma_hoc_phan}
        </Descriptions.Item>
        <Descriptions.Item label="Tên học phần" labelStyle={{ width: "150px" }} style={{ fontSize: "16px" }}>
          {chuong.ma_hp?.ten_hp}
        </Descriptions.Item>
        {chuong.mo_ta && (
          <Descriptions.Item label="Mô tả" labelStyle={{ width: "150px" }} style={{ fontSize: "16px" }}>
            {chuong.mo_ta}
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label="Thi"
          labelStyle={{ width: "150px" }}
          contentStyle={{ marginLeft: "150px", fontSize: "16px" }}
          style={{ fontSize: "16px" }}
        >
          <div style={{ width: "50%" }}>
            <Row>
              <Col span={24} className="text-base">
                <p>Thời gian làm bài: {chuong.thoi_gian_thi}p</p>
              </Col>
              <Col span={24} className="text-base">
                <p>Số câu hỏi: {chuong.so_cau_hoi}</p>
              </Col>
              <Col span={24} className="text-base">
                <p>Điểm tối đa: {chuong.diem_toi_da}</p>
              </Col>
            </Row>
          </div>
        </Descriptions.Item>
        {(chuong as any).extra?.ngay_mo_thi && (chuong as any).extra?.ngay_dong_thi && (
          <Descriptions.Item label="Thời gian thi" labelStyle={{ width: "200px" }} style={{ fontSize: "16px" }}>
            Từ ngày {(chuong as any).extra?.ngay_mo_thi} đến trước ngày {(chuong as any).extra?.ngay_dong_thi}
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};
export default Info;
