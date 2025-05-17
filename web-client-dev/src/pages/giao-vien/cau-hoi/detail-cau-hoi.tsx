import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import BaseHandlerGetDetail from "@/components/base-handler-get-detail";
import { STATUS_QUESTION } from "@/constant";
import { useGiaoVienApi } from "@/hooks/useGiaoVien";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { ROLE } from "@/interface/user";
import PageContainer from "@/Layout/PageContainer";
import HuyCauHoiDialog from "@/pages/tro-ly-hoc-phan/cau-hoi/dialogHuy";
import SuaDoKhoDialog from "@/pages/tro-ly-hoc-phan/cau-hoi/dialogSuaDoKho";
import DuyetDoKhoDialog from "@/pages/tro-ly-hoc-phan/cau-hoi/duyetDoKho";
import CreatNEditPhanBienDialog from "@/pages/tro-ly-hoc-phan/createNEditPhanBien";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { queryOptions } from "@tanstack/react-query";
import { Button, Col, Row } from "antd";
import Title from "antd/es/typography/Title";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ModalXemTruocCauHoi from "./modal-xem-truoc-cau-hoi";
import { CauHoiChuong } from "./part/cau-hoi-chuong";
import { CauHoiHistory } from "./part/cau-hoi-history";
import { CauHoiInfo } from "./part/cau-hoi-info";
import { CauHoiPhanBien } from "./part/cau-hoi-phan-bien";
import { CauHoiViewComplex } from "./part/cau-hoi-view-complex";

const DetailPage: FC<{ isTroLy?: boolean; cauHoi: HocPhanCauHoi; setKeyRender: (params: any) => void }> = ({
  isTroLy,
  cauHoi,
  setKeyRender
}) => {
  const authUser = useAppSelector(getAuthUser);
  const { t } = useTranslation("chi-tiet-cau-hoi");
  const { id } = useParams();
  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách câu hỏi" }, { text: "Câu hỏi" }, { text: "#" + id }];
  }, [id]);
  const [modalSend, setModalSend] = useState<boolean>(false);
  const [modalPhanBien, setModalPhanBien] = useState<boolean>(false);
  const [modalHuy, setModalHuy] = useState<boolean>(false);
  const { items: giaoVien } = useGiaoVienApi();
  const role_hp_assistant = authUser?.roles.includes(ROLE.hp_assistant);
  const role_assistant = authUser?.roles.includes(ROLE.assistant);
  const role_teacher = authUser?.roles.includes(ROLE.teacher);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalSuaDoKho, setModalSuaDoKho] = useState<boolean>(false);
  const [modalDuyetDoKho, setModalDuyetDoKho] = useState<boolean>(false);

  const ButtonOfGiaoVien = () => {
    const check_trang_thai =
      cauHoi?.trang_thai == STATUS_QUESTION.MOI_TAO || cauHoi?.trang_thai == STATUS_QUESTION.CAN_SUA;
    const showGuiPheDuyet = check_trang_thai && role_teacher && !isTroLy;
    return (
      <>
        {showGuiPheDuyet && (
          <Row align="middle" className="p-2">
            <Col span={24} className="flex flex-row-reverse">
              <Button
                type="primary"
                onClick={() => {
                  setModalSend(true);
                }}
              >
                {t("action.gui_phe_duyet")}
              </Button>
            </Col>
          </Row>
        )}
      </>
    );
  };

  const ButtonOfTroLy = () => {
    const showBtnHpAssistant = (role_hp_assistant || role_assistant) && isTroLy;
    return (
      <>
        {showBtnHpAssistant && (
          <Row align="middle" className="p-2">
            <Col span={24} className="flex flex-row-reverse">
              {cauHoi?.trang_thai == STATUS_QUESTION.DANG_SU_DUNG && (
                <div className="flex gap-4">
                  <Button
                    type="primary"
                    onClick={() => {
                      setModalSuaDoKho(true);
                    }}
                  >
                    {t("action.sua_do_kho")}
                  </Button>
                  <Button
                    style={{ backgroundColor: "#c02135", color: "white", borderColor: "red" }}
                    onClick={() => {
                      setModalHuy(true);
                    }}
                  >
                    {t("action.huy")}
                  </Button>
                </div>
              )}
              {cauHoi?.trang_thai == STATUS_QUESTION.PHE_DUYET_DO_KHO && (
                <div className="flex gap-4">
                  <Button
                    type="primary"
                    onClick={() => {
                      setModalDuyetDoKho(true);
                    }}
                  >
                    {t("action.phe_duyet_do_kho")}
                  </Button>
                  <Button
                    style={{ backgroundColor: "#c02135", color: "white", borderColor: "red" }}
                    onClick={() => {
                      setModalHuy(true);
                    }}
                  >
                    {t("action.huy")}
                  </Button>
                </div>
              )}
              {cauHoi?.trang_thai == STATUS_QUESTION.CHO_PHAN_BIEN ? (
                <Button
                  type="primary"
                  onClick={() => {
                    setModalPhanBien(true);
                  }}
                >
                  {t("action.giao_phan_bien")}
                </Button>
              ) : (cauHoi?.trang_thai == STATUS_QUESTION.CHO_DUYET1 ||
                  cauHoi?.trang_thai == STATUS_QUESTION.CHO_DUYET2) &&
                cauHoi.cau_hoi_phan_bien[0]?.trang_thai_cau_hoi == STATUS_QUESTION.CHO_DUYET ? (
                <Button
                  type="primary"
                  onClick={() => {
                    setIsEdit(true);
                    setModalPhanBien(true);
                  }}
                >
                  {t("action.change_phan_bien")}
                </Button>
              ) : cauHoi?.trang_thai == STATUS_QUESTION.CHO_PHAN_BIEN2 ? (
                <Button
                  type="primary"
                  onClick={() => {
                    setModalPhanBien(true);
                  }}
                >
                  {t("action.giao_phan_bien_2")}
                </Button>
              ) : (
                ""
              )}
            </Col>
          </Row>
        )}
      </>
    );
  };
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Title level={3} className="pt-3">
        {t("menu.thong_tin")}
      </Title>
      <CauHoiInfo data={cauHoi} />
      <Title level={3} className="pt-3">
        {t("menu.cau_hoi")}
      </Title>
      <CauHoiViewComplex cauHoi={cauHoi} button={isTroLy ? <ButtonOfTroLy /> : <ButtonOfGiaoVien />} />
      <Title level={3} className="pt-3">
        {t("menu.chuong")}
      </Title>
      <CauHoiChuong cauHoi={cauHoi} isTroLy={isTroLy} />
      <Title level={3} className="pt-3">
        {t("menu.phan_bien")}
      </Title>
      <CauHoiPhanBien isTroLy={isTroLy} />
      {isTroLy && (
        <>
          <Title level={3} className="pt-3">
            {t("menu.lich_su")}
          </Title>
          <CauHoiHistory />
        </>
      )}
      <ModalXemTruocCauHoi
        openModal={modalSend}
        closeModal={setModalSend}
        setKeyRender={setKeyRender}
        dataEdit={cauHoi}
      />

      <CreatNEditPhanBienDialog
        showModal={modalPhanBien}
        setShowModal={setModalPhanBien}
        giaoVien={giaoVien}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        dataItem={cauHoi}
        readonlyCauHoi={true}
      />
      <HuyCauHoiDialog
        show={modalHuy}
        setShow={setModalHuy}
        data={cauHoi}
        api={cauHoiApi.huyCauHoi}
        route={"../"}
        warningText={"Bạn có chắc muốn xoá câu hỏi này không? Hành động này không thể được hoàn tác"}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
      />
      <SuaDoKhoDialog
        show={modalSuaDoKho}
        setShow={setModalSuaDoKho}
        data={cauHoi}
        api={cauHoiApi.suaDoKhoCauHoi}
        route={"../"}
        warningText={"Bạn có chắc muốn yêu cầu sửa độ khó câu hỏi này không? Hành động này không thể được hoàn tác"}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
      />

      <DuyetDoKhoDialog
        title={"Phê duyệt độ khó"}
        show={modalDuyetDoKho}
        setShow={setModalDuyetDoKho}
        data={cauHoi}
        api={cauHoiApi.duyetDoKhoCauHoi}
        setKeyRender={setKeyRender}
        translation="danh-sach-cau-hoi"
      />
    </PageContainer>
  );
};

const Page: FC<{ isTroLy?: boolean }> = ({ isTroLy }) => {
  const [keyRender, setKeyRender] = useState<any>();
  const { id } = useParams();
  const option = queryOptions({
    queryKey: ["cau-hoi", id!, isTroLy, keyRender] as const,
    enabled: !!id,
    retry: 0,
    queryFn: ({ queryKey }) => {
      const [, id, isTroLy] = queryKey;
      return (isTroLy ? cauHoiApi.showCauHoiTroLyHp(id) : cauHoiApi.showCauHoiGv(id)).then((res) => res.data);
    }
  });
  return (
    <BaseHandlerGetDetail option={option}>
      {(data) => <DetailPage cauHoi={data} isTroLy={isTroLy} setKeyRender={setKeyRender} />}
    </BaseHandlerGetDetail>
  );
};
export default Page;
