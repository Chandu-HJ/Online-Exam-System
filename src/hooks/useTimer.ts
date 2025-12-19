import { useEffect, useState } from "react";

export function useTimer(
  examStartTime: number | null,
  duration: number
) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  useEffect(() => {
    if (!examStartTime) return;

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - examStartTime) / 1000
      );

      const remaining = duration - elapsedSeconds;

      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [examStartTime, duration]);

  return timeLeft;
}
