import { Card, Checkbox, Col, Descriptions, DescriptionsProps, Form, Radio, Row, Typography } from "antd";
import { ChuongCellRender, LoaiThiCellRender } from "@/components/TrangThaiCellRender";
import { FC, useMemo } from "react";

import { CheckCircleOutlined } from "@ant-design/icons";
import MathDisplay from "@/components/MathDisplay";
import PageContainer from "@/Layout/PageContainer";
import dayjs from "@/utils/date";
import { useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};

const { Text, Title } = Typography;
const BaiThiSinhVienDetailPage: FC<any> = () => {
  const { t } = useTranslation("danh-sach-bai-thi");
  const [form] = Form.useForm();
  const bai_thi: any = useLoaderData();
  const modifiedBaiThiData = bai_thi.bai_thi_cau_hoi as any[];
  const so_cau_dung = bai_thi.bai_thi_cau_hoi.reduce((acc: number, cur: any) => {
    return acc + cur.is_correct;
  }, 0);

  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách bài thi" }, { text: "Chi tiết bài thi" }, { text: `#${bai_thi.id}` }];
  }, []);
  const itemsInfo: DescriptionsProps["items"] = useMemo(
    () => [
      {
        key: "1",
        label: <p className="text-black">{t("field.ma_hp")}</p>,
        children: bai_thi.chuong?.ma_hoc_phan
      },
      {
        key: "2",
        label: <p className="text-black">{t("field.ten")}</p>,
        children: <ChuongCellRender ten={bai_thi.chuong?.ten} stt={bai_thi.chuong?.stt} />
      },
      {
        key: "3",
        label: <p className="text-black">{t("field.name")}</p>,
        children: bai_thi.sinh_vien?.name
      },
      {
        key: "3.1",
        label: <p className="text-black">{t("field.mssv")}</p>,
        children: bai_thi.sinh_vien?.mssv
      },
      {
        key: "4",
        label: <p className="text-black">{t("field.bat_dau_thi_at")}</p>,
        children: <DateFormat data={bai_thi.bat_dau_thi_at} />
      },
      {
        key: "5",
        label: <p className="text-black">{t("field.ket_thuc_thi_at")}</p>,
        children: <DateFormat data={bai_thi.ket_thuc_thi_at} />
      },
      {
        key: "6",
        label: <p className="text-black">{t("field.loai")}</p>,
        children: LoaiThiCellRender({ data: bai_thi.loai })
      },
      {
        key: "7",
        label: <p className="text-black">{t("field.diem")}</p>,
        children: bai_thi.diem
      },
      {
        key: "8",
        label: <p className="text-black">{t("field.so_cau_dung")}</p>,
        children: so_cau_dung
      }
    ],
    [t]
  );

  const questions = useMemo(() => {
    return modifiedBaiThiData.map((item: any) => {
      const lua_chon = typeof item.lua_chon === "string" ? JSON.parse(item.lua_chon) : item.lua_chon;
      return {
        id: item.id,
        content: item.noi_dung,
        answers: lua_chon.map((answer: any) => ({
          id: answer.id,
          content: answer.content
        })),
        stt: item.order + 1,
        loai: item.loai,
        dap_an: typeof item.dap_an === "string" ? JSON.parse(item.dap_an) : item.dap_an,
        ket_qua: typeof item.ket_qua === "string" ? JSON.parse(item.ket_qua) : item.ket_qua,
        is_chua_tra_loi: item.updated_at == item.created_at
      };
    });
  }, [modifiedBaiThiData]);
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <div>
        <Form form={form} {...layout} labelWrap>
          <Title level={3}>Thông tin</Title>
          <Row>
            <Descriptions items={itemsInfo} className="custom_descriptions mt-4" />
          </Row>

          <Title level={3}>Bài thi</Title>
          <Text type="warning">Câu có viền đỏ là sinh viên chưa trả lời</Text>
          <Row gutter={[16, 16]}>
            {questions.map((question: any) => {
              const dapAn = typeof question.ket_qua === "string" ? JSON.parse(question.ket_qua) : question.ket_qua;
              const selectedAnswers = Array.isArray(dapAn) ? dapAn : [];

              return (
                <Col xs={24} sm={24} md={24} lg={8} xl={8} key={question.id}>
                  <Card
                    className={`h-full ${question.is_chua_tra_loi ? "border-rose-600" : ""}`}
                    title={
                      <div className="mb-0 py-5">
                        <div className="font-medium text-sm">{`Câu ${question.stt}`}</div>
                        <div className="font-medium text-base whitespace-break-spaces">
                          <MathDisplay mathString={question.content} />
                        </div>
                      </div>
                    }
                  >
                    {question.dap_an.length > 1 ? (
                      <Checkbox.Group
                        options={question.answers.map((answer: any) => ({
                          label: (
                            <div
                              className={`d-flex w-full justify-between ${question.dap_an?.includes(answer.id) ? "text-emerald-500 font-bold" : ""}`}
                            >
                              <MathDisplay mathString={answer.content} />{" "}
                              {question.dap_an?.includes(answer.id) && (
                                <CheckCircleOutlined style={{ fontSize: "20px" }} />
                              )}
                            </div>
                          ),
                          value: answer.id
                        }))}
                        value={selectedAnswers}
                        className="box-test-questions"
                      />
                    ) : (
                      <Radio.Group
                        className="box-test-questions box-radio"
                        options={question.answers.map((answer: any) => ({
                          label: (
                            <div
                              className={`d-flex w-full justify-between ${question.dap_an?.includes(answer.id) ? "text-emerald-500 font-bold" : ""}`}
                            >
                              <MathDisplay mathString={answer.content} />{" "}
                              {question.dap_an?.includes(answer.id) && (
                                <CheckCircleOutlined style={{ fontSize: "20px" }} />
                              )}
                            </div>
                          ),
                          value: answer.id
                        }))}
                        value={selectedAnswers[0]}
                      ></Radio.Group>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Form>
      </div>{" "}
    </PageContainer>
  );
};

export default BaiThiSinhVienDetailPage;

const DateFormat: FC<any> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }

  const formatDate = dayjs(data).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm");
  return <span>{formatDate}</span>;
};
