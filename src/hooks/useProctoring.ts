import { useEffect, useRef } from "react";
import type { ViolationType } from "../context/ExamContext";

export function useProctoring(
  addViolation: (type: ViolationType) => void
) {
  const lastViolationTime = useRef(0);

  const shouldLog = () => {
    const now = Date.now();
    if (now - lastViolationTime.current < 800) return false;
    lastViolationTime.current = now;
    return true;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && shouldLog()) {
        addViolation("TAB_SWITCH");
      }
    };

    const handleWindowBlur = () => {
      // Delay check to allow visibilitychange to fire first
      setTimeout(() => {
        if (
          document.visibilityState === "visible" &&
          shouldLog()
        ) {
          addViolation("WINDOW_BLUR");
        }
      }, 100);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [addViolation]);
}
