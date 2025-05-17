import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import MathDisplay from "@/components/MathDisplay";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { DeleteOutlined, EditOutlined, PlusOutlined, ProfileOutlined } from "@ant-design/icons";
import { Button, Checkbox, Collapse, Layout, Radio, Space, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import { CollapseProps } from "antd/lib";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import ModalCauHoiChuong from "./modal-cau-hoi-chuong";

interface Question {
  id: number;
  noi_dung: string;
  lua_chon: {
    id: string;
    content: string;
    correct: boolean;
  }[];
  loai: string;
}

interface QuestionListProps {
  questions: Question[];
  loadingQuestion: boolean;
  setKeyRender: Dispatch<SetStateAction<number>>;
  maHocPhan: string | undefined;
  selectedChuong: string | null;
}

const ListCauHoiPage: React.FC<QuestionListProps> = ({
  questions,
  loadingQuestion,
  setKeyRender,
  maHocPhan,
  selectedChuong
}) => {
  useTranslation("cau-hoi-chuong-hoc-phan");
  const [modalDelete, setModalDelete] = useState(false);
  const [idCauHoiSelected, setIdCauHoiSelected] = useState<number>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState<Question | undefined>();
  const [isFormAddQuestion, setIsFormAddQuestion] = useState(true);

  const genExtra = (dataEdit: Question) => (
    <>
      <EditOutlined
        key="edit"
        className="mx-2"
        onClick={(event) => {
          event.stopPropagation();
          setIsEdit(true);
          setIsModalOpen(true);
          setDataEdit(dataEdit);
        }}
      />
      <DeleteOutlined
        key="delete"
        className="mx-2"
        onClick={(event) => {
          event.stopPropagation();
          onDeleteItem(dataEdit.id);
        }}
      />
    </>
  );

  const onDeleteItem = (data: any) => {
    setIdCauHoiSelected(data);
    setModalDelete(true);
  };

  const renderMath = (content: string) => {
    return <MathDisplay mathString={content} />;
  };

  const items: CollapseProps["items"] = questions.map((question, index) => ({
    key: question.id.toString(),
    label: (
      <>
        {`Câu ${index + 1}: `}
        {renderMath(question.noi_dung)}
      </>
    ),
    children: (
      <>
        {question.lua_chon.map((answer: any) => (
          <Space key={answer.id} className="d-flex mb-3">
            {question.loai === "multi" ? (
              <Checkbox checked={answer.correct}>{renderMath(answer.content)}</Checkbox>
            ) : (
              <Radio checked={answer.correct}>{renderMath(answer.content)}</Radio>
            )}
          </Space>
        ))}
      </>
    ),
    extra: genExtra(question)
  }));

  return (
    <>
      <Layout>
        <Content>
          <div className="d-flex items-center justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginBottom: "16px", marginRight: "8px" }}
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddQuestion(true);
              }}
            >
              Thêm Câu Hỏi
            </Button>
            <Button
              type="primary"
              icon={<ProfileOutlined />}
              style={{ marginBottom: "16px", marginRight: "8px" }}
              onClick={() => {
                setIsModalOpen(true);
                setIsFormAddQuestion(false);
              }}
            >
              Thêm bằng văn bản
            </Button>
          </div>
          {loadingQuestion ? (
            <div className="p-2 w-full text-center">
              <Spin />
            </div>
          ) : questions.length > 0 ? (
            <Collapse className="my-2" items={items} defaultActiveKey={[]} />
          ) : (
            <div className="p-2 text-center w-full"> chủ đề chưa có câu hỏi nào</div>
          )}
        </Content>
      </Layout>
      <ModalCauHoiChuong
        openModal={isModalOpen}
        closeModal={setIsModalOpen}
        isEdit={isEdit}
        setEdit={setIsEdit}
        setKeyRender={setKeyRender}
        maHocPhan={maHocPhan}
        selectedChuong={selectedChuong}
        dataEdit={dataEdit}
        isFormAddQuestion={isFormAddQuestion}
      />
      <DeleteDialog
        openModal={modalDelete}
        closeModal={setModalDelete}
        apiDelete={() => idCauHoiSelected && hocPhanChuongApi.deleteCauHoi(idCauHoiSelected)}
        setKeyRender={setKeyRender}
        translation="cau-hoi-chuong-hoc-phan"
        name={"câu hỏi"}
      />
    </>
  );
};

export default ListCauHoiPage;
