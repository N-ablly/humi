import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { HumiLogo } from "@/components/humi/HumiLogo";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [{ title: "Event QR — Humi.ai" }, { name: "robots", content: "noindex" }],
  }),
  component: EventQrPage,
});

// Display page for the booth standee / TV and a source of the printable QR
// image. The code carries ?src=event so every lead it produces is tagged.
function EventQrPage() {
  const [target, setTarget] = useState("");
  const canvasWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTarget(`${window.location.origin}/?src=event`);
  }, []);

  const download = () => {
    const canvas = canvasWrap.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "humi-event-qr.png";
    a.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <HumiLogo showTagline />
      <h1 className="mt-8 max-w-2xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
        Scan to get your free <span className="text-gradient-primary">AI career report</span>
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        No resume needed. Share your LinkedIn or just tell us about your work, and Humi.ai builds
        your personal career coaching report in minutes.
      </p>

      <div
        ref={canvasWrap}
        className="mt-10 rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-lift)]"
      >
        {target ? (
          <QRCodeCanvas value={target} size={360} level="M" marginSize={0} fgColor="#B00020" />
        ) : (
          <div className="h-[360px] w-[360px]" />
        )}
      </div>

      <p className="mt-5 break-all text-sm font-semibold text-muted-foreground">{target}</p>

      <button
        onClick={download}
        disabled={!target}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-foreground print:hidden disabled:opacity-50"
      >
        <Download className="h-4 w-4" /> Download QR image
      </button>
    </main>
  );
}
