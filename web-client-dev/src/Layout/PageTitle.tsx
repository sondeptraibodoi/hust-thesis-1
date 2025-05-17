import { FC, memo, useEffect } from "react";

const PageTitle: FC<{ title: string }> = memo((props) => {
  useEffect(() => {
    const title = "Hệ thống số hóa - Viện Toán Ứng dụng và Tin học - Đại học Bách khoa Hà Nội";
    document.title = props.title ? `${props.title} - ${title}` : title;
    return () => {
      document.title = title;
    };
  }, [props.title]);
  return null;
});

export default PageTitle;
