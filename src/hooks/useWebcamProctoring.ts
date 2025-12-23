import { useEffect, useRef } from "react";
import { startWebcam } from "../utils/webcamSnapshot";

export function useWebcamProctoring(
  examId: string | null,
  enabled: boolean
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !examId) return;
    if (startedRef.current) return;

    startedRef.current = true;

    const init = async () => {
      // wait until <video> is mounted
      while (!videoRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }

      const video = videoRef.current;
      const stream = await startWebcam(video);
      streamRef.current = stream;
    };

    init();

    return () => {
      // optional: stop camera after exam
      const stream = streamRef.current;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, examId]);

  return videoRef;
}
