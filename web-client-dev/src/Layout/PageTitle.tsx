import { FC, memo, useEffect } from "react";

const PageTitle: FC<{ title: string }> = memo((props) => {
  useEffect(() => {
    const title = "Đồ án - Đại học Bách khoa Hà Nội";
    document.title = props.title ? `${props.title} - ${title}` : title;
    return () => {
      document.title = title;
    };
  }, [props.title]);
  return null;
});

export default PageTitle;
