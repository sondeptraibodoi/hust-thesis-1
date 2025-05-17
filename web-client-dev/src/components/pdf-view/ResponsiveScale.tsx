import { useEffect, useState } from "react";

const useResponsiveScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;

      if (width <= 425) {
        setScale(0.89);
      } else if (width <= 768) {
        setScale(0.94);
      } else if (width <= 1024) {
        setScale(0.943);
      } else if (width <= 1440) {
        setScale(0.96);
      } else if (width <= 2560) {
        setScale(0.97);
      } else {
        setScale(0.97);
      }
    };

    window.addEventListener("resize", updateScale);
    updateScale();

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
};

export default useResponsiveScale;
