import { HocPhanCauHoi } from "@/interface/cauHoi";
import { Checkbox, Form, Input, Typography } from "antd";
import "katex/dist/katex.min.css";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { convertTexToJson, isMultiBlock, isSolutionBlock } from "./convert";

export const CauHoiRawMany: FC<{
  onChange: (value: Partial<HocPhanCauHoi>[]) => void;
  contentArrayRaw: string;
  setContentArrayRaw: any;
}> = ({ onChange, contentArrayRaw, setContentArrayRaw }) => {
  const form = Form.useFormInstance();
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const handleChange = (e: any) => {
    const newValue = e.target.value;
    const cau_hois = convertTexToJson(newValue);
    const cau_hoi: any[] = [];
    for (let index = 0; index < cau_hois.length; index++) {
      const element = cau_hois[index];
      if (isMultiBlock(element)) {
        cau_hoi.push({
          noi_dung: element.noi_dung,
          lua_chon: element.lua_chon,
          dap_an: element.dap_an,
          loai: element.loai,
          do_kho: element.tags.tags
        });
      } else if (isSolutionBlock(element) && cau_hoi.length > 0) {
        cau_hoi[cau_hoi.length - 1].loi_giai = element.noi_dung;
      }
    }
    form.setFieldValue("cau_hois", cau_hoi);
    onChange(cau_hoi);
    setContentArrayRaw(newValue);
  };
  return (
    <>
      <Typography.Title level={5}>{t("field.is_machine")}</Typography.Title>
      <Form.Item name="is_machine" valuePropName="checked">
        <Checkbox>Tích chọn nếu câu hỏi sinh tự động</Checkbox>
      </Form.Item>
      <Typography.Title level={5}>{t("field.danh_sach_cau_hoi")}</Typography.Title>
      <Form.Item hidden name="cau_hois">
        <Input></Input>
      </Form.Item>
      <Form.Item rules={[{ required: true }]}>
        <Input.TextArea
          rows={10}
          placeholder="Nhập danh sách câu hỏi"
          onChange={handleChange}
          value={contentArrayRaw}
        />
      </Form.Item>
    </>
  );
};
// function convertString(noiDungRaw: string): Partial<HocPhanCauHoi>[] {
//   const cauHoiArray: Partial<HocPhanCauHoi>[] = [];
//   const multiRegex = /\\begin\{multi\}(.*?)\\end\{multi\}/gs;
//   let match;

//   while ((match = multiRegex.exec(noiDungRaw)) !== null) {
//     const multiContent = match[1];
//     const questionMatch = multiContent.match(/\n(.*?)(?=\\item)/s);
//     const itemsMatch = multiContent
//       .split(/(?:^|\n)\s*(\\item\*?|\s*\\item\[fraction=-100\]|\s*\\item)/)
//       .slice(1)
//       .map((item: any) => item.replace(/\[fraction=-100\]/g, ""));

//     if (questionMatch && itemsMatch) {
//       const question = questionMatch[1].trim();

//       const answers = itemsMatch.reduce(
//         (acc: { id: string; contentArrayRaw: string; checked: boolean }[], item: any, index: any, array: any) => {
//           if (item.startsWith("\\item") || item.startsWith("\\item*") || item.startsWith("\\item[fraction=-100]")) {
//             const isCorrect = item.startsWith("\\item*");
//             const answerContent = array[index + 1] ? array[index + 1].trim() : "";
//             acc.push({
//               id: `uuid${index / 2 + 1}`,
//               contentArrayRaw: answerContent,
//               checked: isCorrect
//             });
//           }
//           return acc;
//         },
//         []
//       );

//       const luaChon = answers.map((answer: any) => ({
//         id: answer.id,
//         content: answer.contentArrayRaw,
//         correct: answer.checked
//       }));

//       const dapAn = answers.filter((answer: any) => answer.checked).map((answer: any) => answer.id);

//       const loai = dapAn.length === 1 ? "single" : "multi";
//       cauHoiArray.push({
//         noi_dung: question,
//         lua_chon: luaChon,
//         dap_an: dapAn,
//         loai: loai
//       });
//     }
//   }
//   return cauHoiArray;
// }
