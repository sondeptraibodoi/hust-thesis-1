import ConfirmDialog, { ConfirmHandle } from "@/components/confirm";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import cauHoiApi, { cauHoiTroLyApi } from "@/api/cauHoi/cauHoi.api";
import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import BaseHandlerGetDetail from "@/components/base-handler-get-detail";
import { Button } from "antd";
import { CauHoiChuong } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-chuong";
import { CauHoiHistory } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-history";
import { CauHoiInfo } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-info";
import { CauHoiPhanBien } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-phan-bien";
import { CauHoiViewComplex } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-view-complex";
import CreatNEditPhanBienDialog from "./phan-bien-dialog";
import DuyetDoKhoDialog from "../duyetDoKho";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import HuyCauHoiDialog from "../dialogHuy";
import ModalCauHoiGv from "@/pages/giao-vien/cau-hoi/modal-cau-hoi-gv";
import PageContainer from "@/Layout/PageContainer";
import { STATUS_QUESTION } from "@/constant";
import SuaDoKhoDialog from "../dialogSuaDoKho";
import Title from "antd/es/typography/Title";
import { useGiaoVienApi } from "@/hooks/useGiaoVien";
import { useTranslation } from "react-i18next";

const Page: FC = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const option = queryOptions({
    queryKey: ["cau-hoi", id!, "tro-ly-hoc-phan"],
    enabled: !!id,
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return cauHoiApi
        .getDetail(+id, {
          with: "primaryChuong.chuong,primaryChuong.maHp,primaryChuong.loaiThi,phanBien.giaoVien,createdBy,chuongs.chuong"
        })
        .then((res) => res.data);
    }
  });
  return (
    <BaseHandlerGetDetail option={option}>
      {(data) => (
        <DetailPage
          data={data}
          onReload={() => {
            queryClient.refetchQueries({ queryKey: ["cau-hoi"] });
          }}
        />
      )}
    </BaseHandlerGetDetail>
  );
};
export default Page;

const DetailPage: FC<{ data: HocPhanCauHoi; onReload: () => any }> = ({ data, onReload }) => {
  const { t } = useTranslation("chi-tiet-cau-hoi");
  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách câu hỏi" }, { text: "Câu hỏi" }, { text: "#" + data.id }];
  }, [data]);
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Title level={3} className="pt-3">
        {t("menu.thong_tin")}
      </Title>
      <CauHoiInfo data={data} isTroLy />
      <Title level={3} className="pt-3">
        {t("menu.cau_hoi")}
      </Title>
      <CauHoiViewComplex cauHoi={data} button={<ExtraButton data={data} onReload={onReload} />} />
      <Title level={3} className="pt-3">
        {t("menu.chuong")}
      </Title>
      <CauHoiChuong cauHoi={data} isTroLy />
      <Title level={3} className="pt-3">
        {t("menu.phan_bien")}
      </Title>
      <CauHoiPhanBien id={data.id} isTroLy />
      <Title level={3} className="pt-3">
        {t("menu.lich_su")}
      </Title>
      <CauHoiHistory />
    </PageContainer>
  );
};
const ExtraButton: FC<{ data: HocPhanCauHoi; onReload: () => void }> = ({ data, onReload }) => {
  const confirmDialogRef = useRef<ConfirmHandle>(null);
  const { t } = useTranslation(["chi-tiet-cau-hoi", "common"]);
  const [modalPhanBien, setModalPhanBien] = useState<boolean>(false);
  const { items: giaoVien } = useGiaoVienApi();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalSuaDoKho, setModalSuaDoKho] = useState<boolean>(false);
  const [modalHuy, setModalHuy] = useState<boolean>(false);
  const [modalDuyetDoKho, setModalDuyetDoKho] = useState<boolean>(false);
  const [modalSua, setModalSua] = useState<boolean>(false);
  const [isCopy, setIsCopy] = useState(false);
  const navigate = useNavigate();
  const onCopyItem = useCallback(() => {
    setIsCopy(true);
    setModalSua(true);
  }, []);
  const handleCopyConfirmClick = useCallback(async (data: HocPhanCauHoi) => {
    if (!confirmDialogRef.current) {
      return;
    }
    if (!data || !data.id) {
      return;
    }

    await confirmDialogRef.current.open({
      title: "Đi tới trang chi tiết",
      text: "Thầy\\Cô có muốn đi tới trang chi tiết của câu hỏi vừa sao chép không?",
      click: () => {
        navigate(`../${data.id}`);
      }
    });
  }, []);
  return (
    <>
      <div className="flex">
        <div className="flex-auto"></div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              onCopyItem();
            }}
          >
            {t("action.copy", { ns: "common" })}
          </Button>
          {![STATUS_QUESTION.DANG_SU_DUNG].includes(data.trang_thai) && (
            <>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  setModalSua(true);
                }}
              >
                {t("action.sua")}
              </Button>
            </>
          )}
          {[STATUS_QUESTION.CHO_PHAN_BIEN].includes(data.trang_thai) && (
            <>
              <Button
                type="primary"
                onClick={() => {
                  setModalPhanBien(true);
                }}
              >
                {t("action.giao_phan_bien")}
              </Button>
            </>
          )}
          {[STATUS_QUESTION.CHO_DUYET1, STATUS_QUESTION.CHO_DUYET2].includes(data.trang_thai) && (
            <>
              <Button
                type="primary"
                onClick={() => {
                  setIsEdit(true);
                  setModalPhanBien(true);
                }}
              >
                {t("action.change_phan_bien")}
              </Button>
            </>
          )}
          {[STATUS_QUESTION.CHO_PHAN_BIEN2].includes(data.trang_thai) && (
            <>
              <Button
                type="primary"
                onClick={() => {
                  setModalPhanBien(true);
                }}
              >
                {t("action.giao_phan_bien_2")}
              </Button>
            </>
          )}
          {data.trang_thai == STATUS_QUESTION.DANG_SU_DUNG && (
            <>
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
            </>
          )}
          {data.trang_thai == STATUS_QUESTION.PHE_DUYET_DO_KHO && (
            <>
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
            </>
          )}
        </div>
      </div>

      <CreatNEditPhanBienDialog
        showModal={modalPhanBien}
        setShowModal={setModalPhanBien}
        giaoVien={giaoVien}
        setKeyRender={onReload}
        translation="danh-sach-cau-hoi"
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        dataItem={data}
      />
      <HuyCauHoiDialog
        show={modalHuy}
        setShow={setModalHuy}
        data={data}
        api={cauHoiApi.huyCauHoi}
        warningText={"Bạn có chắc muốn xoá câu hỏi này không? Hành động này không thể được hoàn tác"}
        setKeyRender={() => {
          navigate("../");
        }}
        translation="danh-sach-cau-hoi"
      />
      <SuaDoKhoDialog
        show={modalSuaDoKho}
        setShow={setModalSuaDoKho}
        data={data}
        api={cauHoiApi.suaDoKhoCauHoi}
        route={"../"}
        warningText={"Bạn có chắc muốn yêu cầu sửa độ khó câu hỏi này không? Hành động này không thể được hoàn tác"}
        setKeyRender={onReload}
        translation="danh-sach-cau-hoi"
      />
      <DuyetDoKhoDialog
        title={"Phê duyệt độ khó"}
        show={modalDuyetDoKho}
        setShow={setModalDuyetDoKho}
        data={data}
        api={cauHoiApi.duyetDoKhoCauHoi}
        setKeyRender={onReload}
        translation="danh-sach-cau-hoi"
      />
      <ConfirmDialog ref={confirmDialogRef} />
      {modalSua && (
        <ModalCauHoiGv
          openModal={modalSua}
          closeModal={setModalSua}
          isEdit={true}
          setEdit={setIsEdit}
          setKeyRender={() => {}}
          dataEdit={data}
          isCopy={isCopy}
          setCopy={setIsCopy}
          isFormAddQuestion={false}
          isFormAddManyQuestion={false}
          apiSubmit={(data) =>
            apiSubmit(data, { isCopy }).then((res) => {
              if (isCopy) {
                handleCopyConfirmClick(res.data.data);
              } else {
                onReload();
              }
            })
          }
        />
      )}
    </>
  );
};

const apiSubmit = (data: HocPhanCauHoi, options: { isCopy: boolean }) => {
  if (options.isCopy) {
    return cauHoiTroLyApi.copy(data.id, data);
  }
  return cauHoiApi.update(data);
};
