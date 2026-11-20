"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/app/hoc/AuthGuard";
import {
  fetchIdentityVerificationStatus,
  IdentityVerificationResponse,
  submitIdentityVerification,
} from "@/utils/api";

const imageOkay = (file: File | null) =>
  !!file &&
  ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
  file.size <= 5 * 1024 * 1024;
const preview = (file: File | null) =>
  file ? URL.createObjectURL(file) : null;

function IdentityVerification() {
  const [status, setStatus] = useState<IdentityVerificationResponse | null>(
      null,
    ),
    [step, setStep] = useState(0),
    [name, setName] = useState(""),
    [ninDocument, setDocument] = useState<File | null>(null),
    [selfie, setSelfie] = useState<File | null>(null),
    [consent, setConsent] = useState(false),
    [error, setError] = useState(""),
    [sending, setSending] = useState(false),
    [camera, setCamera] = useState(false),
    [cameraReady, setCameraReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const stopCamera = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCamera(false);
    setCameraReady(false);
  };
  useEffect(() => {
    fetchIdentityVerificationStatus()
      .then(setStatus)
      .catch(() => setError("We couldn't load your verification status."));
    return stopCamera;
  }, []);
  useEffect(() => {
    const videoElement = video.current;
    const activeStream = stream.current;
    if (!camera || !videoElement || !activeStream) return;
    videoElement.srcObject = activeStream;
    let active = true;
    const startPlayback = () => {
      void videoElement.play().catch(() => {
        if (active) {
          setError("The camera preview could not start. Please try again.");
        }
      });
    };
    videoElement.addEventListener("loadedmetadata", startPlayback);
    if (videoElement.readyState >= 1) startPlayback();
    return () => {
      active = false;
      videoElement.removeEventListener("loadedmetadata", startPlayback);
      if (videoElement.srcObject === activeStream)
        videoElement.srcObject = null;
    };
  }, [camera]);
  const startCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser does not support camera access. Please use a modern browser.",
      );
      return;
    }
    try {
      stopCamera();
      const activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (!activeStream.getVideoTracks().some((track) => track.readyState === "live")) {
        activeStream.getTracks().forEach((track) => track.stop());
        throw new Error("No active camera video track was returned.");
      }
      stream.current = activeStream;
      setCameraReady(false);
      setCamera(true);
    } catch {
      setError(
        "Camera access is unavailable. Allow camera access to take your live selfie.",
      );
    }
  };
  const capture = () => {
    const canvas = window.document.createElement("canvas");
    const videoElement = video.current;
    if (!videoElement) return;
    if (
      videoElement.readyState < 2 ||
      videoElement.videoWidth === 0 ||
      videoElement.videoHeight === 0
    ) {
      setError("The camera preview is not ready yet. Please wait and try again.");
      return;
    }
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("The selfie could not be captured. Please try again.");
      return;
    }
    context.drawImage(videoElement, 0, 0);
    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) {
          setError("The selfie could not be captured. Please try again.");
          return;
        }
        setSelfie(new File([blob], "live-selfie.jpg", { type: "image/jpeg" }));
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  };
  const submit = async () => {
    if (!ninDocument || !selfie || !consent)
      return setError("Add both images and give consent before submitting.");
    setSending(true);
    setError("");
    const data = new FormData();
    data.append("legal_full_name", name);
    data.append("nin_document", ninDocument);
    data.append("live_selfie", selfie);
    data.append("consent", "true");
    data.append("consent_version", "2026-identity-v1");
    try {
      setStatus(await submitIdentityVerification(data));
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSending(false);
    }
  };
  if (!status)
    return (
      <main className="mx-auto max-w-xl p-8 text-[#35506f]">
        Loading verification…
      </main>
    );
  const terminal =
    status.status !== "NOT_SUBMITTED" &&
    status.status !== "REJECTED" &&
    status.status !== "RESUBMISSION_REQUIRED";
  if (terminal || step === 4)
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
          {status.status.replaceAll("_", " ")}
        </span>
        <h1 className="mt-5 text-3xl font-bold text-[#0d478c]">
          {status.status === "VERIFIED"
            ? "Your identity verification is complete."
            : "Your verification is awaiting review."}
        </h1>
        <p className="mt-3 text-[#53749b]">
          {status.status === "VERIFIED"
            ? "You can now access NestBuddy's roommate matching and accommodation services."
            : "Our team will notify you when there is an update."}
        </p>
        {status.submitted_at && (
          <p className="mt-3 text-sm text-slate-500">
            Submitted {new Date(status.submitted_at).toLocaleDateString()}
          </p>
        )}
        <button
          onClick={() =>
            router.push(
              status.status === "VERIFIED" ? params.get("next") || "/" : "/",
            )
          }
          className="mt-6 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white"
        >
          Back to Home
        </button>
      </main>
    );
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-[#2879ef]">Step {step + 1} of 4</p>
        <div className="mt-3 h-2 rounded bg-blue-50">
          <div
            className="h-2 rounded bg-[#2879ef]"
            style={{ width: `${(step + 1) * 25}%` }}
          />
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {step === 0 && (
          <>
            <h1 className="mt-6 text-3xl font-bold text-[#0d478c]">
              Verify your identity
            </h1>
            <p className="mt-3 text-[#53749b]">
              Verify your identity to unlock roommate matching and accommodation
              discovery. You’ll need your NIN document and a clear live selfie.
            </p>
            <p className="mt-5 text-sm text-[#53749b]">
              Your documents are confidential and accessible only to authorised
              verification personnel.{" "}
              <Link href="/privacy-policy" className="font-bold text-[#2879ef]">
                Privacy Policy
              </Link>
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-6 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white"
            >
              Start verification
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="mt-6 text-2xl font-bold text-[#0d478c]">
              Upload your NIN document
            </h1>
            <p className="mt-2 text-sm text-[#53749b]">
              Use a clear front photo. Keep all details visible, well-lit, and
              free of glare.
            </p>
            <input
              aria-label="NIN document"
              className="mt-5 block w-full text-sm"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (!imageOkay(f))
                  setError(
                    "Use a readable JPEG, PNG, or WebP image up to 5 MB.",
                  );
                else {
                  setDocument(f);
                  setError("");
                }
              }}
            />
            {ninDocument && (
              <img
                className="mt-4 max-h-64 rounded-xl"
                src={preview(ninDocument)!}
                alt="NIN document preview"
              />
            )}
            <button
              disabled={!ninDocument}
              onClick={() => setStep(2)}
              className="mt-6 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              Continue
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="mt-6 text-2xl font-bold text-[#0d478c]">
              Take a live selfie
            </h1>
            <p className="mt-2 text-sm text-[#53749b]">
              Face the camera in good lighting with your face fully visible.
              Gallery uploads are not accepted for this step.
            </p>
            {camera ? (
              <>
                <video
                  ref={video}
                  autoPlay
                  muted
                  playsInline
                  onPlaying={() => {
                    setCameraReady(true);
                    setError("");
                  }}
                  className="mt-5 block min-h-64 w-full rounded-xl bg-slate-900 object-cover"
                />
                {!cameraReady && (
                  <p role="status" className="mt-2 text-sm text-[#53749b]">
                    Starting camera preview…
                  </p>
                )}
                <button
                  onClick={capture}
                  disabled={!cameraReady}
                  className="mt-4 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-50"
                >
                  Capture selfie
                </button>
                <button
                  onClick={() => void startCamera()}
                  className="ml-4 text-sm font-bold text-[#2879ef]"
                >
                  Restart camera
                </button>
              </>
            ) : selfie ? (
              <>
                <img
                  className="mt-5 max-h-72 rounded-xl"
                  src={preview(selfie)!}
                  alt="Captured live selfie"
                />
                <button
                  onClick={startCamera}
                  className="mt-4 text-sm font-bold text-[#2879ef]"
                >
                  Retake selfie
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="ml-4 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white"
                >
                  Continue
                </button>
              </>
            ) : (
              <button
                onClick={startCamera}
                className="mt-5 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white"
              >
                Open camera
              </button>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="mt-6 text-2xl font-bold text-[#0d478c]">
              Review and submit
            </h1>
            <input
              className="mt-4 w-full rounded-lg border p-3 text-black-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Legal full name on NIN document"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ninDocument && (
                <img
                  className="h-36 w-full rounded-xl object-cover"
                  src={preview(ninDocument)!}
                  alt="NIN preview"
                />
              )}
              {selfie && (
                <img
                  className="h-36 w-full rounded-xl object-cover"
                  src={preview(selfie)!}
                  alt="Selfie preview"
                />
              )}
            </div>
            <label className="mt-5 flex gap-3 text-sm text-[#35506f]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I consent to NestBuddy processing my NIN document and selfie for
              identity verification under its Privacy Policy.
            </label>
            <button
              disabled={sending || !name.trim() || !consent}
              onClick={submit}
              className="mt-6 rounded-xl bg-[#2879ef] px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {sending ? "Submitting…" : "Submit for verification"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
export default function Page() {
  return (
    <AuthGuard>
      <IdentityVerification />
    </AuthGuard>
  );
}
