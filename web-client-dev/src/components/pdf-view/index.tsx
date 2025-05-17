import { DoubleLeftOutlined, DoubleRightOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Result } from "antd";
import Title from "antd/es/typography/Title";
import React, { ReactNode, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import "./PdfViewer.css";
import "core-js/full/promise/with-resolvers.js";
import useResponsiveScale from "./ResponsiveScale";
// @ts-expect-error This does not exist outside of polyfill which this is doing
if (typeof Promise.withResolvers === "undefined") {
  if (typeof window !== "undefined") {
    // @ts-expect-error This does not exist outside of polyfill which this is doing
    window.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  } else {
    // @ts-expect-error This does not exist outside of polyfill which this is doing
    global.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}
const workerSrc =
  process.env.NODE_ENV === "production"
    ? `//unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs`
    : new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
interface PdfViewerProps {
  file: string | undefined;
  readTime: number;
  examTime: number;
  onRead: () => void;
  onLastPageReached: () => void;
  totalPages: number;
  ShowAfterEnd?: ReactNode;
  canShowAfterEnd?: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  file,
  readTime,
  onRead,
  onLastPageReached,
  totalPages,
  canShowAfterEnd,
  ShowAfterEnd
}) => {
  const [numPages, setNumPages] = useState<number | null>(totalPages || null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [remainingReadTime, setRemainingReadTime] = useState<number>(readTime);
  const [showAfterEnd, setShowAfterEnd] = useState<boolean>(false);

  const scale = useResponsiveScale();

  useEffect(() => {
    const updateDimensions = () => {
      const containerWidth = document.getElementById("pdf-container")?.clientWidth;
      const containerHeight = containerWidth ? containerWidth * 1.294 : null;

      setPageWidth(containerWidth ?? null);
      setPageHeight(containerHeight);
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (remainingReadTime > 0) {
      const timer = setInterval(() => {
        setRemainingReadTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 60000);

      return () => clearInterval(timer);
    }
  }, [remainingReadTime]);

  useEffect(() => {
    setPageNumber(1);
    onRead();
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onNextPage = () => {
    if (pageNumber < numPages!) {
      setPageNumber(pageNumber + 1);
    }
    if (pageNumber === numPages) {
      onLastPageReached();
      setPageNumber(numPages! + 1);
      setShowAfterEnd(true);
    }
  };

  const onPrevPage = () => {
    setShowAfterEnd(false);
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };
  return (
    <div className="pdf-viewer">
      <div id="pdf-container" className="pdf-container">
        {!showAfterEnd && pageWidth && pageHeight && (
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <TransformWrapper minScale={0.5} maxScale={5} limitToBounds={false}>
              <TransformComponent>
                <Page pageNumber={pageNumber} width={pageWidth * scale} height={pageHeight} />
              </TransformComponent>
            </TransformWrapper>
          </Document>
        )}

        {canShowAfterEnd &&
          showAfterEnd &&
          (remainingReadTime > 0 ? (
            <Result
              status="warning"
              title={
                <p style={{ fontSize: "20px" }}>
                  Bạn đọc quá nhanh. Hãy xem lại tài liệu trước khi có thể bắt đầu thi. Thời gian đọc còn lại{" "}
                  <strong style={{ color: "#CF1627" }}>{remainingReadTime}</strong> phút
                </p>
              }
            />
          ) : (
            ShowAfterEnd
          ))}
        <Button className="prev-button" type="primary" onClick={onPrevPage} disabled={pageNumber === 1}>
          <DoubleLeftOutlined />
        </Button>
        {canShowAfterEnd ? (
          <Button className="next-button" type="primary" onClick={onNextPage} disabled={showAfterEnd}>
            <DoubleRightOutlined />
          </Button>
        ) : (
          <Button className="next-button" type="primary" onClick={onNextPage} disabled={pageNumber === numPages}>
            <DoubleRightOutlined />
          </Button>
        )}
      </div>
      {file && (
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: "16px",
            color: "#CF1627"
          }}
        >
          {showAfterEnd ? (
            <span>Thi</span>
          ) : (
            <strong>
              Trang {pageNumber} / {numPages}
            </strong>
          )}
        </div>
      )}
      <Modal
        open={modalVisible}
        centered
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel} type="primary">
            Đồng ý
          </Button>
        ]}
      >
        <div className="model-container">
          <div className="">
            <Title level={4} style={{ color: "#FF5B05" }}>
              <ExclamationCircleOutlined className="me-2" />
              Cảnh báo
            </Title>
          </div>
          <p style={{ fontSize: "16px" }}>
            Bạn đang đọc nhanh hơn bình thường, vui lòng không chuyển trang liên tục khi học!
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PdfViewer;
