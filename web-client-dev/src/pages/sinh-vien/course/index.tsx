import PdfViewer from "@/components/pdf-view";
import { FieldId } from "@/interface/common";
import { HpChuongTaiLieu } from "@/interface/hoc-phan";
import { Lop } from "@/interface/lop";
import { App, Button, Col, Result, Row } from "antd";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import BaiThiChuongPage from "./bai-thi-chuong";
import CourseContent from "./CourseContent";
import ExamSelect, { HpChuongThi } from "./exam-select";
import Info from "./info";

export const ViewCoursePage: FC<{
  showPdfOnly?: boolean;
  chuongs: HpChuongThi[];
  canExam?: boolean;
  diems?: Record<FieldId, string>;
  onReload?: () => void;
  lop?: Lop;
}> = ({ showPdfOnly, chuongs: ChuongTaiLieu, canExam, diems = {}, onReload, lop }) => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<{
    chuong: HpChuongThi;
    taiLieu: HpChuongTaiLieu | null;
  } | null>(
    ChuongTaiLieu && ChuongTaiLieu.length > 0
      ? { chuong: ChuongTaiLieu[0], taiLieu: ChuongTaiLieu[0].tai_lieus ? ChuongTaiLieu[0].tai_lieus[0] : null }
      : null
  );

  const [, setViewedDocuments] = useState<{ [key: number]: boolean }>({});
  const [enabledDocuments, setEnabledDocuments] = useState<{ [key: number]: boolean }>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  const [loaiThi, setLoaiThi] = useState("");
  const [resultContent, setResultContent] = useState<React.ReactNode | null>(null);
  const { notification: apiContext } = App.useApp();
  useEffect(() => {
    const dataCheckRole: HpChuongThi[] = ChuongTaiLieu;
    if (dataCheckRole?.length > 0) {
      const defaultEnabledDocuments: { [key: number]: boolean } = {};
      dataCheckRole.forEach((chuong: HpChuongThi) => {
        if (chuong.tai_lieus && chuong.tai_lieus.length >= 0) {
          const firstTaiLieu = chuong?.tai_lieus?.[0];
          if (firstTaiLieu) defaultEnabledDocuments[firstTaiLieu.id] = true;
        }
      });
      setEnabledDocuments(defaultEnabledDocuments);
    }
  }, [ChuongTaiLieu]);

  const handleSelect = (item: { chuong: HpChuongThi; taiLieu: HpChuongTaiLieu | null }) => {
    const { chuong, taiLieu } = item;

    if (taiLieu === null) {
      setSelectedItem({ chuong, taiLieu: null });
      setSelectedKeys([]);
      setCheckedKeys([]);
    } else {
      setSelectedItem(item);
      setSelectedKeys([`${taiLieu.id}`]);
      setCheckedKeys((prevCheckedKeys) => {
        if (!prevCheckedKeys.includes(`${taiLieu.id}`)) {
          return [...prevCheckedKeys, `${taiLieu.id}`];
        }
        return prevCheckedKeys;
      });
      setResultContent(null);
    }
  };

  const markDocumentAsViewed = (taiLieuId: number) => {
    setViewedDocuments((prev) => ({ ...prev, [taiLieuId]: true }));
  };

  const enableNextDocument = (currentChuong: HpChuongThi, currentTaiLieu: HpChuongTaiLieu) => {
    const currentIndex = currentChuong.tai_lieus!.findIndex((tl) => tl.id === currentTaiLieu.id);
    if (currentIndex !== -1 && currentIndex < currentChuong.tai_lieus!.length - 1) {
      const nextTaiLieu = currentChuong.tai_lieus![currentIndex + 1];
      setEnabledDocuments((prev) => ({ ...prev, [nextTaiLieu.id]: true }));
      setSelectedItem({ chuong: currentChuong, taiLieu: nextTaiLieu });
      setSelectedKeys([`${nextTaiLieu.id}`]);
      setCheckedKeys((prevCheckedKeys) => {
        if (!prevCheckedKeys.includes(`${nextTaiLieu.id}`)) {
          return [...prevCheckedKeys, `${nextTaiLieu.id}`];
        }
        return prevCheckedKeys;
      });
    }
  };
  if (!ChuongTaiLieu || ChuongTaiLieu.length < 1) {
    return (
      <Result
        title="Không hỗ trợ thi"
        subTitle={
          <Button key="return" className="mt-3" onClick={() => navigate(-1)}>
            Quay lại trang trước
          </Button>
        }
      ></Result>
    );
  }
  let viewChuong = undefined;
  if (selectedItem) {
    const { chuong, taiLieu } = selectedItem;
    if (taiLieu) {
      viewChuong = (
        <>
          <PdfViewer
            key={taiLieu.id}
            file={taiLieu.duong_dan}
            readTime={chuong.thoi_gian_doc}
            examTime={chuong.thoi_gian_thi}
            onRead={() => taiLieu && markDocumentAsViewed(taiLieu.id)}
            onLastPageReached={() => taiLieu && enableNextDocument(chuong, taiLieu)}
            totalPages={Number(taiLieu.so_trang)}
            canShowAfterEnd
            ShowAfterEnd={
              <ExamSelect
                onSelectExam={setLoaiThi}
                chuong={selectedItem.chuong}
                diem={diems[selectedItem.chuong.id]}
                canExam={canExam}
              />
            }
          />
        </>
      );
    } else {
      viewChuong = (
        <ExamSelect
          onSelectExam={setLoaiThi}
          chuong={selectedItem.chuong}
          diem={diems[selectedItem.chuong.id]}
          canExam={canExam}
          title="Chương này không yêu cầu tài liệu bắt buộc phải xem"
        />
      );
    }
  }
  if (showPdfOnly) {
    return (
      <Row className="pdf_width">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <div style={{ minHeight: "450px" }}>{resultContent ? resultContent : viewChuong}</div>
        </Col>
      </Row>
    );
  }
  if (!showPdfOnly && loaiThi && selectedItem?.chuong) {
    return (
      <BaiThiChuongPage
        loaiThi={loaiThi}
        setLoaiThi={setLoaiThi}
        dataChuong={selectedItem.chuong}
        apiContext={apiContext}
        onDone={onReload}
        lop={lop}
      />
    );
  }
  return (
    <Row
      className="pdf_width"
      // style={{ minHeight: "100vh" }}
    >
      <Col xs={24} sm={24} md={24} lg={18} xl={18}>
        <div style={{ minHeight: "450px" }}>{resultContent ? resultContent : viewChuong}</div>
        {selectedItem && <Info chuong={selectedItem.chuong} />}
      </Col>

      <Col xs={24} sm={24} md={24} lg={6} xl={6}>
        <CourseContent
          chuongTaiLieu={ChuongTaiLieu}
          onSelect={handleSelect}
          enabledDocuments={enabledDocuments}
          selectedKeys={selectedKeys}
          checkedKeys={checkedKeys}
          diems={diems}
        />
      </Col>
    </Row>
  );
};
const CoursePage: FC = () => {
  const navigate = useNavigate();
  const { chuongs, diems, lop } = useLoaderData() as {
    chuongs: HpChuongThi[];
    diems: Record<FieldId, string>;
    lop: Lop;
  };
  const onReload = useCallback(() => {
    navigate(".", { replace: true });
  }, []);
  return <ViewCoursePage chuongs={chuongs} diems={diems} onReload={onReload} canExam={true} lop={lop} />;
};
export default CoursePage;
