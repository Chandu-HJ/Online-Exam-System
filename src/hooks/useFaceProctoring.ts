import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import type { ViolationType } from "../context/ExamContext";

const CHECK_INTERVAL = 1000;

export function useFaceProctoring(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onFaceMissing: () => void,
  onFacePresent: () => void,
  onViolation: (type: ViolationType) => void
) {
  const intervalRef = useRef<number | null>(null);
  const violationFiredRef = useRef(false);

  useEffect(() => {
    faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  }, []);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5,
        })
      );

      if (detections.length === 0) {
        onFaceMissing();
      } else {
        violationFiredRef.current = false;
        onFacePresent();
      }

      if (detections.length > 1) {
        onViolation("MULTIPLE_FACES_DETECTED");
      }
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, videoRef, onFaceMissing, onFacePresent, onViolation]);
}
