"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createLocalRecording,
  saveChunk,
  updateLocalRecording,
  type LocalRecording,
} from "./local-store";
import { MAX_RECORDING_BYTES, MAX_RECORDING_SECONDS } from "./types";
export type RecorderState = "idle" | "requesting" | "recording" | "stopping";
export function useRecorder(
  owner: string,
  onSaved: (record: LocalRecording) => void,
) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const started = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const active = useRef(false);
  const lifecycle = useRef({ version: 0, mounted: true });
  const stopReason = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);
  const cleanup = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
    active.current = false;
    setLevel(0);
  }, []);
  const stop = useCallback((interrupted = false) => {
    if (!recorder.current || recorder.current.state === "inactive") return;
    stopReason.current ||= interrupted;
    setState("stopping");
    recorder.current.stop();
  }, []);
  const start = useCallback(async () => {
    if (active.current) return;
    active.current = true;
    const version = ++lifecycle.current.version;
    setError(null);
    setNotice(null);
    setSeconds(0);
    setState("requesting");
    stopReason.current = false;
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error(
          "Audio recording is not supported here. Open this page in a desktop Chromium browser using HTTPS or localhost.",
        );
      const media = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
        video: false,
      });
      if (version !== lifecycle.current.version) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const mime = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mime)
        throw new Error(
          "This browser does not support a compatible recording format. Try Chrome or Helium.",
        );
      const record = await createLocalRecording(owner, mime);
      if (version !== lifecycle.current.version) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      const device = new MediaRecorder(media, {
        mimeType: mime,
        audioBitsPerSecond: 48000,
      });
      recorder.current = device;
      let index = 0;
      let bytes = 0;
      let persistenceFailed = false;
      let writes = Promise.resolve();
      device.ondataavailable = (event) => {
        if (!event.data.size) return;
        bytes += event.data.size;
        const chunkIndex = index++;
        writes = writes
          .then(() => saveChunk(record.id, chunkIndex, event.data))
          .catch(() => {
            persistenceFailed = true;
            setError(
              "Your device could not save more audio. The recording has stopped. Free some space and download the saved portion.",
            );
            stop(true);
          });
        if (bytes >= MAX_RECORDING_BYTES - 1024 * 1024) {
          setNotice(
            "The recording reached the file size limit and was stopped.",
          );
          stop();
        }
      };
      device.onerror = () => {
        setError(
          "The microphone was interrupted. The captured audio has been kept.",
        );
        stop(true);
      };
      device.onstop = async () => {
        const duration = Math.min(
          MAX_RECORDING_SECONDS,
          (performance.now() - started.current) / 1000,
        );
        cleanup();
        await writes;
        const saved = {
          ...record,
          duration,
          interrupted: stopReason.current || persistenceFailed,
          complete: !persistenceFailed,
        };
        try {
          await updateLocalRecording(record.id, saved);
          if (lifecycle.current.mounted) onSavedRef.current(saved);
        } catch {
          setError(
            "The recording stopped, but saving failed. Check the recordings saved on this device.",
          );
        }
        setState("idle");
      };
      media.getAudioTracks().forEach((track) =>
        track.addEventListener("ended", () => {
          if (device.state === "recording") {
            setError(
              "Your microphone disconnected. The captured audio has been kept.",
            );
            stop(true);
          }
        }),
      );
      const context = new AudioContext();
      audioContext.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(media).connect(analyser);
      const samples = new Uint8Array(analyser.frequencyBinCount);
      started.current = performance.now();
      device.start(1000);
      setState("recording");
      timer.current = setInterval(() => {
        const elapsed = (performance.now() - started.current) / 1000;
        setSeconds(elapsed);
        analyser.getByteTimeDomainData(samples);
        setLevel(
          Math.min(
            1,
            Math.sqrt(
              samples.reduce((sum, x) => sum + ((x - 128) / 128) ** 2, 0) /
                samples.length,
            ) * 6,
          ),
        );
        if (elapsed >= MAX_RECORDING_SECONDS) {
          setNotice(
            "The one-hour limit was reached. Your recording has been stopped and saved.",
          );
          stop();
        }
      }, 150);
    } catch (cause) {
      cleanup();
      setState("idle");
      setError(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Microphone access is blocked. Allow access in your browser and try again."
          : cause instanceof Error
            ? cause.message
            : "Recording could not start. Please try again.",
      );
    }
  }, [owner, cleanup, stop]);
  useEffect(() => {
    const lifecycleState = lifecycle.current;
    lifecycleState.mounted = true;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (active.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      lifecycleState.version++;
      lifecycleState.mounted = false;
      if (recorder.current?.state === "recording") {
        stopReason.current = true;
        recorder.current.stop();
      }
      if (timer.current) clearInterval(timer.current);
      stream.current?.getTracks().forEach((track) => track.stop());
      void audioContext.current?.close();
    };
  }, []);
  return {
    state,
    seconds,
    error,
    notice,
    level,
    start,
    stop,
    busy: state !== "idle",
  };
}
