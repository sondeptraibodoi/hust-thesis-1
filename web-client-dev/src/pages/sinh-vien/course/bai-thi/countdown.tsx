import { FC, useEffect, useState } from "react";

export const CountdownTimer: FC<{ targetDate: string; onDone?: () => void }> = ({ targetDate, onDone }) => {
  const [timeRemaining, setTimeRemaining] = useState(+new Date(targetDate) - Date.now());
  useEffect(() => {
    if (timeRemaining <= 0) return;

    // Set interval and store its ID
    const interval = setInterval(() => {
      setTimeRemaining(() => {
        const newTime = +new Date(targetDate) - Date.now();
        if (newTime <= 0) {
          clearInterval(interval); // Clear the interval when time reaches zero
          onDone && onDone(); // Trigger the onDone callback
        }
        return newTime;
      });
    }, 1000);

    // Cleanup interval on component unmount or when the countdown finishes
    return () => clearInterval(interval);
  }, [timeRemaining, targetDate, onDone]);

  return timeRemaining > 0 ? formatTime(timeRemaining) : "00:00";
};
const formatTime = (time: number) => {
  const minutes = Math.floor((time / 1000 / 60) % 60);
  const seconds = Math.floor((time / 1000) % 60); // Calculate seconds
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
