import { HocPhanCauHoi } from "@/interface/cauHoi";
import { Checkbox, Form, Input, Typography } from "antd";
import "katex/dist/katex.min.css";
import { FC, memo } from "react";
import { useTranslation } from "react-i18next";
import { convertTexToJson, isMultiBlock, isSolutionBlock } from "./convert";

export const CauHoiRaw: FC<{
  onChange: (value: Partial<HocPhanCauHoi>) => void;
  content: string;
  setContent: any;
}> = memo(({ onChange, content, setContent }) => {
  const form = Form.useFormInstance();
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const handleChange = (e: any) => {
    const newValue = e.target.value;
    const cau_hois = convertTexToJson(newValue);

    let cau_hoi: any = null;
    for (let index = 0; index < cau_hois.length; index++) {
      const element = cau_hois[index];
      if (isMultiBlock(element)) {
        cau_hoi = {
          noi_dung: element.noi_dung,
          lua_chon: element.lua_chon,
          dap_an: element.dap_an,
          loai: element.loai
        };
      } else if (isSolutionBlock(element) && cau_hoi) {
        cau_hoi.loi_giai = element.noi_dung;
      }
    }
    form.setFieldsValue(cau_hoi);
    onChange(cau_hoi);
    setContent(newValue);
  };
  return (
    <>
      <Typography.Title level={5}>{t("field.is_machine")}</Typography.Title>
      <Form.Item name="is_machine" valuePropName="checked">
        <Checkbox>Tích chọn nếu câu hỏi sinh tự động</Checkbox>
      </Form.Item>
      <Typography.Title level={5}>{t("field.noi_dung")}</Typography.Title>
      <Form.Item hidden name="noi_dung">
        <Input></Input>
      </Form.Item>
      <Form.Item hidden name="lua_chon">
        <Input></Input>
      </Form.Item>
      <Form.Item hidden name="loi_giai">
        <Input></Input>
      </Form.Item>
      <Form.Item hidden name="dap_an">
        <Input></Input>
      </Form.Item>
      <Form.Item rules={[{ required: true }]}>
        <Input.TextArea rows={10} placeholder="Soạn câu hỏi" onChange={handleChange} value={content} />
      </Form.Item>
    </>
  );
});
// function convertString(noiDungRaw: string): Partial<HocPhanCauHoi> {
//   const cauhoi: Partial<HocPhanCauHoi> = {};
//   const multiMatch = noiDungRaw.match(/\\begin\{multi\}(.*?)\\end\{multi\}/s);
//   if (multiMatch) {
//     const multiContent = multiMatch[1];
//     const questionMatch = multiContent.match(/\n(.*?)(?=\\item)/s);
//     const itemsMatch = multiContent
//       .split(/(?:^|\n)\s*(\\item\*?|\s*\\item\[fraction=-100\]|\s*\\item)/)
//       .slice(1)
//       .map((item: any) => item.replace(/\[fraction=-100\]/g, ""));

//     if (questionMatch && itemsMatch) {
//       const question = questionMatch[1].trim();

//       const answers = itemsMatch.reduce(
//         (acc: { id: string; content: string; checked: boolean }[], item: any, index: any, array: any) => {
//           if (item.startsWith("\\item") || item.startsWith("\\item*") || item.startsWith("\\item[fraction=-100]")) {
//             const isCorrect = item.startsWith("\\item*");
//             const answerContent = array[index + 1] ? array[index + 1].trim() : "";
//             acc.push({
//               id: `uuid${index / 2 + 1}`,
//               content: answerContent,
//               checked: isCorrect
//             });
//           }
//           return acc;
//         },
//         []
//       );

//       const luaChon = answers.map((answer: any) => ({
//         id: answer.id,
//         content: answer.content,
//         correct: answer.checked
//       }));

//       const dapAn = answers.filter((answer: any) => answer.checked).map((answer: any) => answer.id);

//       const loai = dapAn.length === 1 ? "single" : "multi";
//       cauhoi.noi_dung = question;
//       cauhoi.lua_chon = luaChon;
//       cauhoi.dap_an = dapAn;
//       cauhoi.loai = loai;
//     }
//   }
//   return cauhoi;
// }
