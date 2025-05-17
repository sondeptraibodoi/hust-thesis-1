import "katex/dist/katex.min.css";

import React, { useEffect, useState } from "react";

import katex from "katex";
import { uniqueId } from "lodash";

interface MathDisplayProps {
  mathString: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ mathString }) => {
  const [formattedQuestion, setFormattedQuestion] = useState<string>("");
  useEffect(() => {
    if (typeof mathString !== "string") {
      console.error("mathString không hợp lệ:", mathString);
      return;
    }
    const texts = mathString.split(/<br\s*\/?>/i);
    let tmp: string = "";
    texts.forEach((text) => {
      const replace: Record<string, string> = {};
      text = replaceBetweenTabularSigns(text, (val) => {
        const key = `table-${new Date().getTime()}-${uniqueId()}`;
        replace[key] = latexToHTMLTable(val);
        return `_{${key}}_`;
      });
      text = replaceBetweenDollarSigns(text, convertLatex);
      text = template(text, replace);
      tmp += text;
      tmp += "<br />";
    });
    setFormattedQuestion(tmp);
  }, [mathString]);

  return formattedQuestion && <div dangerouslySetInnerHTML={{ __html: formattedQuestion }}></div>;
};
function template(template: string, data: Record<string, string>) {
  return template.replace(/_{(.*?)}_/gs, function (_m, key) {
    return Object.hasOwnProperty.call(data, key) ? data[key] : "";
  });
}

function replaceBetweenDollarSigns(text: string, replacementFn: (val: string) => string) {
  // Sử dụng biểu thức chính quy để tìm tất cả các đoạn nằm giữa dấu $
  const regex = /\$(.*?)\$/gs;
  // Thay thế các đoạn nằm giữa dấu $ bằng chuỗi thay thế được xác định bởi hàm replacementFn
  return text.replace(regex, (_match, p1) => {
    // match: toàn bộ đoạn khớp, p1: nội dung giữa các dấu $
    p1 = p1.trim();
    return `${replacementFn(p1)}`;
  });
}
function replaceBetweenTabularSigns(text: string, replacementFn: (val: string) => string) {
  // Sử dụng biểu thức chính quy để tìm tất cả các đoạn nằm giữa dấu $
  const regex = /\$\\begin\{tabular\}(.*?)\\end\{tabular\}\$/gs;
  // Thay thế các đoạn nằm giữa dấu $ bằng chuỗi thay thế được xác định bởi hàm replacementFn
  return text?.replace(regex, (_match, p1) => {
    // match: toàn bộ đoạn khớp, p1: nội dung giữa các dấu $
    p1 = p1.trim();
    return `${replacementFn(p1)}`;
  });
}

function latexToHTMLTable(latex: string) {
  //Vị trí text
  let alignments: string[] = [];
  const alignmentMatch = latex.match(/^\s*\{(.*?)\}\s*/);
  if (alignmentMatch && alignmentMatch[1]) {
    alignments = alignmentMatch[1].replace(/\|/g, "").split("");
    latex = latex.replace(/^\s*\{.*?\}\s*/, "");
  }

  // Xóa các ký tự không cần thiết và chia chuỗi
  latex = latex.replace(/^\s*\\begin{tabular}\{.*?\}\s*|\s*\\end{tabular}\s*/g, "");
  // Loại bỏ phần {|c|c|c|c|c|} nếu có
  latex = latex.replace(/^\s*\{.*?\}\s*/, "");

  latex = latex.replace(/^\s*|\s*$/g, "");
  const rows = latex
    .split("\\hline")
    .filter(Boolean)
    .map((row) => row.trim().replace(/\\\\$/, ""));

  // Tạo bảng HTML
  const table = document.createElement("table");
  table.className = "table-latex";
  const tbody = document.createElement("tbody");

  rows.forEach((row) => {
    row = row.trim();
    const tr = document.createElement("tr");
    const cells = row.split("&");

    cells.forEach((cell, index) => {
      const td = document.createElement("td");
      const alignment = alignments[index] || "c";
      if (alignment === "r") {
        td.className = "text-right";
      } else if (alignment === "l") {
        td.className = "text-left";
      } else {
        td.className = "text-center";
      }
      cell = replaceBetweenDollarSigns(cell, convertLatex);
      td.innerHTML = cell;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  return table.outerHTML;
}
function convertLatex(val: string) {
  const div = document.createElement("div");
  try {
    katex.render(val, div, {
      throwOnError: false,
      displayMode: false
    });
  } catch (e) {
    console.error(`Error rendering math: ${e}`);
  }
  return div.innerHTML;
}
export default MathDisplay;
