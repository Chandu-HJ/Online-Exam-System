import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import type { ViolationType } from "../context/ExamContext";

const CHECK_INTERVAL = 1000;
const NO_FACE_LIMIT = 5;       // seconds
const MULTI_FACE_LIMIT = 5;    // seconds
const MULTI_FACE_COOLDOWN = 2000; // ms

export function useFaceProctoring(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onNoFaceStart: () => void,
  onNoFaceCancel: () => void,
  onViolation: (type: ViolationType) => void
) {
  const intervalRef = useRef<number | null>(null);
  const modelsLoaded = useRef(false);
  const detecting = useRef(false);

  const noFaceSeconds = useRef(0);
  const multiFaceSeconds = useRef(0);
  const multiFaceBlockedUntil = useRef(0);
  const noFacePopupActive = useRef(false);

  /* ================= LOAD MODEL ================= */
  useEffect(() => {
    faceapi.nets.tinyFaceDetector
      .loadFromUri(`${import.meta.env.BASE_URL}models`)
      .then(() => {
        modelsLoaded.current = true;
      });
  }, []);

  /* ================= DETECTION LOOP ================= */
  useEffect(() => {
    if (!enabled || !modelsLoaded.current) return;

    let cancelled = false;

    const waitForVideo = async () => {
      while (
        !cancelled &&
        (!videoRef.current ||
          videoRef.current.readyState < 3 ||
          videoRef.current.videoWidth === 0)
      ) {
        await new Promise((r) => setTimeout(r, 200));
      }
    };

    const start = async () => {
      await waitForVideo();
      if (cancelled) return;

      intervalRef.current = window.setInterval(async () => {
        if (detecting.current) return;
        detecting.current = true;

        try {
          const video = videoRef.current;
          if (!video) return;

          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.3,
            })
          );

          const faceCount = detections.length;
          const now = Date.now();

          /* ---------- NO FACE ---------- */
          if (faceCount === 0) {
            noFaceSeconds.current++;

            if (!noFacePopupActive.current) {
              noFacePopupActive.current = true;
              onNoFaceStart();
            }

            if (noFaceSeconds.current >= NO_FACE_LIMIT) {
              onViolation("NO_FACE_DETECTED");

              // reset
              noFaceSeconds.current = 0;
              noFacePopupActive.current = false;
              onNoFaceCancel();
            }
          } else {
            noFaceSeconds.current = 0;
            if (noFacePopupActive.current) {
              noFacePopupActive.current = false;
              onNoFaceCancel();
            }
          }

          /* ---------- MULTIPLE FACES ---------- */
          if (faceCount > 1 && now > multiFaceBlockedUntil.current) {
            multiFaceSeconds.current++;

            if (multiFaceSeconds.current >= MULTI_FACE_LIMIT) {
              onViolation("MULTIPLE_FACES_DETECTED");

              multiFaceSeconds.current = 0;
              multiFaceBlockedUntil.current =
                now + MULTI_FACE_COOLDOWN;
            }
          } else {
            multiFaceSeconds.current = 0;
          }
        } finally {
          detecting.current = false;
        }
      }, CHECK_INTERVAL);
    };

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, videoRef, onNoFaceStart, onNoFaceCancel, onViolation]);
}
