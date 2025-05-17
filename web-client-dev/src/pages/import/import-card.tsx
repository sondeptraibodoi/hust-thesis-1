import { Button, Typography } from "antd";
import { FC, HTMLAttributes, ReactNode } from "react";

const { Title } = Typography;
export const ImportCard: FC<{ label: string; icon: ReactNode } & HTMLAttributes<HTMLElement>> = ({
  label,
  icon,
  ...props
}) => {
  return (
    <div {...props}>
      <div
        style={{ cursor: "pointer", width: 160 }}
        className={
          "bg-white w-full flex items-center justify-center min-w-[150px] w-1/4 max-w-[250px] max-h-[250px] h-full aspect-[3/4] border-gray-200 border-solid "
        }
      >
        <div className="flex flex-col items-center justify-center">
          <Button
            className="decoration-red-500"
            type="primary"
            shape="circle"
            style={{ width: "3rem", height: "3rem" }}
            icon={icon}
          ></Button>
          <Title level={5} className="mt-2 max-h-12 mb-0 ps-1 pe-1 text-center">
            {label}
          </Title>
        </div>
      </div>
    </div>
  );
};
