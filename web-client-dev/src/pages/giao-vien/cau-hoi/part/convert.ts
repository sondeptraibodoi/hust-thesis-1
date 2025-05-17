interface Option {
  id: string;
  content: string;
  correct: boolean;
}

interface MultiBlock {
  type: "multi";
  tags: Record<string, string | number>;
  noi_dung: string;
  lua_chon: Option[];
  dap_an: string[];
  loai: string;
}

interface SolutionBlock {
  type: "solution";
  noi_dung: string;
}

interface GenericBlock {
  type: string;
  noi_dung: string;
}

type Block = MultiBlock | SolutionBlock | GenericBlock;

export function convertTexToJson(input: string): Block[] {
  // 1. Xóa tất cả các comment (bất kỳ thứ gì sau dấu % đến hết dòng)
  const noComments = input.replace(/%.*$/gm, "");

  const output: Block[] = [];

  // 2. Dùng regex để tìm các khối giữa \begin{...} và \end{...}
  //    Cấu trúc khối có dạng:
  //      \begin{type}[attr]{title}
  //         ... nội dung ...
  //      \end{type}
  //    Lưu ý: title không dùng trong JSON đầu ra.
  const blockRegex = /\\begin\{(\w+)\}(?:\[((?:[^\]]|\\\])*)\])?(?:\{([^}]*)\})?([\s\S]*?)\\end\{\1\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(noComments)) !== null) {
    const type = match[1].trim();
    const attrStr = match[2] ? match[2].trim() : "";
    // const title = match[3] ? match[3].trim() : ""; // không dùng trong JSON đầu ra
    const body = match[4].trim();

    if (type === "multi") {
      // 3. Phân tích chuỗi các thuộc tính trong attrStr (ví dụ: points=1,penalty=0,tags={easy})
      const tags: Record<string, string | number> = {};
      if (attrStr) {
        // Tách theo dấu phẩy, không quan tâm đến dấu phẩy trong dấu {}
        const pairs = attrStr.split(/,(?![^{]*})/);
        for (const pair of pairs) {
          const [key, valueRaw] = pair.split("=");
          if (key && valueRaw !== undefined) {
            const keyTrim = key.trim();
            let valueTrim: string | number = valueRaw.trim();
            if (valueTrim.startsWith("{") && valueTrim.endsWith("}")) {
              valueTrim = valueTrim.slice(1, -1);
            } else if (keyTrim === "points" || keyTrim === "penalty") {
              valueTrim = Number(valueTrim);
            }
            tags[keyTrim] = valueTrim;
          }
        }
      }

      // 4. Trong khối multi, nội dung được chia làm 2 phần:
      //    - Phần "content": phần văn bản nằm trước lựa chọn (trước \item)
      //    - Các "options": mỗi lựa chọn bắt đầu bằng \item (hoặc \item* nếu đáp án đúng)
      let content = "";
      const options: Option[] = [];
      const itemIndex = body.indexOf("\\item");
      if (itemIndex !== -1) {
        content = body.substring(0, itemIndex).trim();
        const optionsText = body.substring(itemIndex);
        // Regex để tìm các lựa chọn:
        //    \item(\*?)  => bắt đầu bằng \item, có dấu * nếu đáp án đúng
        //    \s*        => khoảng trắng tùy ý
        //    ([\s\S]*?) => nội dung lựa chọn (không tham lam, đến khi gặp \item tiếp theo hoặc kết thúc)
        const optionRegex = /\\item(\*?)\s*([\s\S]*?)(?=\\item(\*?)|\s*$)/g;
        let optMatch: RegExpExecArray | null;
        let index = 0;
        while ((optMatch = optionRegex.exec(optionsText)) !== null) {
          const correct = optMatch[1] === "*" ? true : false;
          const optionContent = optMatch[2].trim();
          if (optionContent) {
            index++;
            options.push({ content: optionContent, correct, id: `uuid${index + 1}` });
          }
        }
      } else {
        content = body;
      }
      const dap_an = options.filter((x) => x.correct).map((x) => x.id);
      output.push({
        type: "multi",
        tags,
        noi_dung: content,
        lua_chon: options,
        dap_an,
        loai: dap_an.length === 1 ? "single" : "multi"
      });
    } else if (type === "solution") {
      // Với khối solution chỉ cần lấy nội dung bên trong
      output.push({
        type: "solution",
        noi_dung: body.trim()
      });
    } else {
      // Các khối khác (nếu có) có thể xử lý tương tự
      output.push({
        type,
        noi_dung: body.trim()
      });
    }
  }

  return output;
}
export function isMultiBlock(block: Block): block is MultiBlock {
  return block.type === "multi";
}

export function isSolutionBlock(block: Block): block is SolutionBlock {
  return block.type === "solution";
}
