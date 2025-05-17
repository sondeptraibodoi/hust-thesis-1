import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { ChuongCellRender, DoKhoCellRender } from "@/components/TrangThaiCellRender";
import { HocPhanCauHoi, HocPhanCauHoiChuong } from "@/interface/hoc-phan";
import { Loading } from "@/pages/Loading";
import { DeleteOutlined, PlusOutlined, SelectOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { App, Button, Card, Col, Row, Tooltip } from "antd";
import { isAxiosError } from "axios";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { CauHoiChuongModal } from "./cau-hoi-chuong-modal";

export const CauHoiChuong: FC<{
  cauHoi: HocPhanCauHoi;
  isTroLy?: boolean;
}> = ({ cauHoi, isTroLy }) => {
  const [modalDelete, setModalDelete] = useState(false);
  const [dataSelect, setDataSelect] = useState<HocPhanCauHoiChuong | undefined>(undefined);
  const { t } = useTranslation(["danh-sach-cau-hoi", "common"]);
  const { notification: api } = App.useApp();
  const [isModalEdit, setIsModalEdit] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["cau-hoi", cauHoi.id, "chuong"],
    queryFn: ({ queryKey }) => {
      const [, cau_hoi_id] = queryKey;
      return hocPhanChuongApi
        .listChuDeForCauHoi(cau_hoi_id, { with: "chuong" })
        .then((res) => res.data as HocPhanCauHoiChuong[]);
    }
  });
  const mutationMakePrimary = useMutation({
    mutationFn: (data: HocPhanCauHoiChuong) => {
      return hocPhanChuongApi.makePrimaryChuDeForCauHoi(data.cau_hoi_id, data.chuong_id);
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMessage = error?.response?.data?.message || t("message.error_desc_update", { ns: "common" });
        api.error({
          message: t("message.error_update", { ns: "common" }),
          description: errorMessage
        });
      }
    }
  });
  const onCreate = () => {
    setIsModalEdit(true);
  };
  if (isLoading) {
    return (
      <div className="">
        <Loading />
      </div>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {data &&
        data.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.chuong_id}>
            <Card
              className={`h-full ${item.is_primary ? "border-primary " : ""}`}
              title={
                <div className="flex">
                  <div className="truncate flex-auto" title={item.chuong?.ten}>
                    <ChuongCellRender ten={item.chuong?.ten} stt={item.chuong?.stt}></ChuongCellRender>
                  </div>
                  {isTroLy && !item.is_primary && (
                    <>
                      <Tooltip title="Chọn làm chủ đề chính">
                        <Button
                          shape="circle"
                          icon={<SelectOutlined />}
                          type="text"
                          loading={mutationMakePrimary.isPending}
                          onClick={() => {
                            mutationMakePrimary.mutate(item);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title={t("action.delete", { ns: "common" })}>
                        <Button
                          shape="circle"
                          icon={<DeleteOutlined />}
                          type="text"
                          onClick={() => {
                            setModalDelete(true);
                            setDataSelect(item);
                          }}
                        />
                      </Tooltip>
                    </>
                  )}
                </div>
              }
            >
              <p>
                <strong>{t("field.ma_hoc_phan")}: </strong>
                {item.ma_hoc_phan}
              </p>
              <p>
                <strong>{t("field.do_kho")}: </strong>
                <DoKhoCellRender data={item.do_kho} />
              </p>
            </Card>
          </Col>
        ))}
      {isTroLy && (
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className={`h-full flex justify-center items-center w-full`} hoverable onClick={onCreate}>
            <PlusOutlined style={{ fontSize: "40px" }} />
          </Card>
        </Col>
      )}
      {dataSelect && (
        <DeleteDialog
          openModal={modalDelete}
          closeModal={setModalDelete}
          apiDelete={() => hocPhanChuongApi.deleteChuDeForCauHoi(cauHoi.id, dataSelect.chuong_id)}
          renderAgain={() => {
            refetch();
          }}
          name={`chủ đề: ${dataSelect.chuong?.ten} khỏi câu hỏi`}
          translation="common"
        />
      )}
      <CauHoiChuongModal
        open={isModalEdit}
        cauHoi={cauHoi}
        setOpen={setIsModalEdit}
        onReset={() => {
          refetch();
        }}
      />
    </Row>
  );
};
