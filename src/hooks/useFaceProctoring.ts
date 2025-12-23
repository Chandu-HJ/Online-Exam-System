import { useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";

export type FaceStatus = "FACE_OK" | "NO_FACE" | "MULTIPLE_FACES";

const CHECK_INTERVAL = 1500;
const MODEL_PATH = `${import.meta.env.BASE_URL}models`;
const MULTI_FACE_COOLDOWN = 5000;
const NO_FACE_COOLDOWN = 2000;

export function useFaceProctoring(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const modelsLoaded = useRef(false);
  const lastMultiFaceTime = useRef(0);
  const lastFaceTime = useRef(0);
  const faceStatusRef = useRef<FaceStatus>("FACE_OK");

  /* LOAD MODELS */
  useEffect(() => {
    const load = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH);
      modelsLoaded.current = true;
      console.log("Face-api models loaded");
    };
    load();
  }, []);

  const checkFaces = useCallback(async () => {
    if (!enabled || !videoRef.current || !modelsLoaded.current) return;

    const detections = await faceapi.detectAllFaces(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.2,
      })
    );

    if (detections.length === 0) {
      const now = Date.now();
      if (now - lastFaceTime.current >= NO_FACE_COOLDOWN) {
        lastFaceTime.current = now;
        faceStatusRef.current = "NO_FACE";
      }
      return;
      
    }

    if (detections.length > 1) {
      const now = Date.now();
      if (now - lastMultiFaceTime.current >= MULTI_FACE_COOLDOWN) {
        lastMultiFaceTime.current = now;
        faceStatusRef.current = "MULTIPLE_FACES";
      }
      return;
    }

    faceStatusRef.current = "FACE_OK";
  }, [enabled, videoRef]);

  /* START LOOP */
  useEffect(() => {
    if (!enabled || !videoRef.current || intervalRef.current) return;

    const video = videoRef.current;

    const start = () => {
      if (intervalRef.current) return;
      console.log("Starting face detection loop");
      intervalRef.current = setInterval(checkFaces, CHECK_INTERVAL);
    };

    video.addEventListener("canplay", start);

    return () => {
      video.removeEventListener("canplay", start);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, checkFaces, videoRef]);

  return faceStatusRef;
}
