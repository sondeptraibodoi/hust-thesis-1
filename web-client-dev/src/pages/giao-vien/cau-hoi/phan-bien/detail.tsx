import { FC, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BaseHandlerGetDetail from "@/components/base-handler-get-detail";
import { Button } from "antd";
import { CauHoiChuong } from "../part/cau-hoi-chuong";
import { CauHoiInfo } from "../part/cau-hoi-info";
import { CauHoiPhanBien } from "../part/cau-hoi-phan-bien";
import { CauHoiViewComplex } from "../part/cau-hoi-view-complex";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import ModalCauHoiGv from "../modal-cau-hoi-gv";
import PageContainer from "@/Layout/PageContainer";
import { PheDuyetDialog } from "./phe-duyet-dialog";
import Title from "antd/es/typography/Title";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { queryOptions } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const Page: FC = () => {
  const { id } = useParams();
  const option = queryOptions({
    queryKey: ["cau-hoi", id!],
    staleTime: 1000 * 60 * 60,
    enabled: !!id,
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return cauHoiApi
        .getDetail(+id, { with: "primaryChuong.chuong,primaryChuong.maHp,primaryChuong.loaiThi,phanBien" })
        .then((res) => res.data);
    }
  });
  return (
    <BaseHandlerGetDetail option={option}>
      {(data, refetch) => <DetailPage data={data} refetch={refetch} />}
    </BaseHandlerGetDetail>
  );
};
export default Page;

const DetailPage: FC<{ data: HocPhanCauHoi; refetch: any }> = ({ data, refetch }) => {
  const { t } = useTranslation("chi-tiet-cau-hoi");
  const breadcrumbs = useMemo(() => {
    return [
      { router: "../", text: "Danh sách phản biện câu hỏi" },
      { text: "Phản biện câu hỏi" },
      { text: "#" + data.id }
    ];
  }, [data]);
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Title level={3} className="pt-3">
        {t("menu.thong_tin")}
      </Title>
      <CauHoiInfo data={data} />
      <Title level={3} className="pt-3">
        {t("menu.cau_hoi")}
      </Title>
      <CauHoiViewComplex
        cauHoi={data}
        button={
          <ExtraButton
            data={data}
            reload={() => {
              refetch();
            }}
          />
        }
      />
      <Title level={3} className="pt-3">
        {t("menu.chuong")}
      </Title>
      <CauHoiChuong cauHoi={data} />
      <Title level={3} className="pt-3">
        {t("menu.phan_bien")}
      </Title>
      <CauHoiPhanBien id={data.id} onlyMe />
    </PageContainer>
  );
};
const ExtraButton: FC<{ data: HocPhanCauHoi; reload: () => void }> = ({ data, reload }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const [openModal, setOpenModal] = useState(false);
  const [type, setType] = useState<"tuChoi" | "pheDuyet">("tuChoi");
  const [modalSua, setModalSua] = useState<boolean>(false);
  const onSubmit = useCallback(() => {
    navigate("../");
  }, []);
  return (
    <>
      <div className="flex">
        <div className="flex-auto"></div>
        {data && data.phan_bien && data.phan_bien.trang_thai_cau_hoi == "cho_duyet" && (
          <div className="flex gap-4">
            <Button
              variant="text"
              onClick={() => {
                setModalSua(true);
              }}
            >
              {t("action.edit")}
            </Button>
            <Button
              block
              htmlType="submit"
              color="primary"
              variant="outlined"
              onClick={() => {
                setType("tuChoi");
                setOpenModal(true);
              }}
            >
              {t("action.tu_choi")}
            </Button>
            <Button
              block
              htmlType="submit"
              type="primary"
              onClick={() => {
                setType("pheDuyet");
                setOpenModal(true);
              }}
            >
              {t("action.phe_duyet")}
            </Button>
          </div>
        )}
      </div>
      <PheDuyetDialog
        data={data}
        openModal={openModal}
        type={type}
        closeModal={() => setOpenModal(false)}
        onSubmit={onSubmit}
      />

      {modalSua && (
        <ModalCauHoiGv
          openModal={modalSua}
          closeModal={setModalSua}
          isEdit={true}
          setEdit={() => {}}
          setKeyRender={() => {
            reload();
          }}
          dataEdit={data}
          isFormAddQuestion={false}
          isFormAddManyQuestion={false}
          disableChuongs={true}
          apiSubmit={(data) => cauHoiApi.update(data)}
        />
      )}
    </>
  );
};
