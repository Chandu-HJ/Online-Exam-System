import { useEffect, useRef } from "react";
import { startWebcam, captureSnapshot } from "../utils/webcamSnapshot";

export function useWebcamProctoring(
  examId: string | null,
  enabled: boolean
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(false);
  const snapshotTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !examId) return;
    if (startedRef.current) return; // 🔒 run only once per exam

    startedRef.current = true;

    const init = async () => {
      // ⏳ wait until <video> is mounted
      while (!videoRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }

      const video = videoRef.current;

      // 🎥 start webcam (permission already granted)
      const stream = await startWebcam(video);
      streamRef.current = stream;

      const takeSnapshot = () => {
        // 🛡️ safety checks
        if (!video) return;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          scheduleNext();
          return;
        }

        const image = captureSnapshot(video);
        if (!image) {
          scheduleNext();
          return;
        }

        const key = `exam-webcam-${examId}`;
        const existing: Array<{ time: number; image: string }> =
          JSON.parse(localStorage.getItem(key) || "[]");

        existing.push({
          time: Date.now(),
          image,
        });

        localStorage.setItem(key, JSON.stringify(existing));

        scheduleNext();
      };

      const scheduleNext = () => {
        const nextDelay =
          Math.random() * (90_000 - 30_000) + 30_000; // 30–90 sec

        snapshotTimerRef.current = window.setTimeout(
          takeSnapshot,
          nextDelay
        );
      };

      // 🚀 first snapshot after camera stabilizes
      snapshotTimerRef.current = window.setTimeout(
        takeSnapshot,
        8_000
      );
    };

    init();

    return () => {
      // 🧹 clear timers only (do NOT stop webcam mid-exam)
      if (snapshotTimerRef.current) {
        clearTimeout(snapshotTimerRef.current);
      }
    };
  }, [enabled, examId]);

  return videoRef;
}
