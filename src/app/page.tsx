"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  StopCircle,
  ImagePlus,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  QrCode,
} from "lucide-react";

type ScanRecord = {
  id: string;
  rawText: string;
  aiAnalysis?: string;
  createdAt: string;
};

export default function QRScannerAIApp() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<ScanRecord[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleDecoded = async (decodedText: string) => {
    setScannedText(decodedText);
    setAiResult("");
    setErrorMsg("");

    const item: ScanRecord = {
      id: Date.now().toString(),
      rawText: decodedText,
      createdAt: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setHistory((prev) => [item, ...prev.slice(0, 9)]);
  };

  const startCameraScan = async () => {
    setErrorMsg("");
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(regionId);
      }
      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleDecoded(decodedText);
          stopCameraScan();
        },
        () => {}
      );
    } catch {
      setIsScanning(false);
      setErrorMsg("تعذر تشغيل الكاميرا. تأكد من إعطاء صلاحية الكاميرا للمتصفح.");
    }
  };

  const stopCameraScan = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      // تجاهل أخطاء الإيقاف
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(regionId);
      }
      const result = await scannerRef.current.scanFile(file, true);
      await handleDecoded(result);
    } catch {
      setErrorMsg("لم يتم العثور على QR Code واضح في هذه الصورة.");
    } finally {
      e.target.value = "";
    }
  };

  const analyzeWithAI = async () => {
    if (!scannedText || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiResult("");

    try {
      const res = await fetch("/api/analyze-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: scannedText }),
      });
      const data = await res.json();
      setAiResult(data.analysis || "تم الفحص.");
    } catch {
      setAiResult("تعذر تحليل المحتوى حالياً.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyText = async () => {
    if (!scannedText) return;
    await navigator.clipboard.writeText(scannedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isUrl = /^https?:\/\//i.test(scannedText.trim());

  return (
    <div
      dir="rtl"
      className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-zinc-950 text-zinc-100 border-x border-zinc-800"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3.5 bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm">قارئ QR الذكي</h1>
            <p className="text-[11px] text-zinc-400">مسح فوري + تحليل بالذكاء الاصطناعي</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* منطقة الكاميرا */}
        <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-3 space-y-3">
          <div
            id={regionId}
            className="w-full min-h-[220px] rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center"
          />

          <div className="grid grid-cols-2 gap-2.5">
            {!isScanning ? (
              <button
                type="button"
                onClick={startCameraScan}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                <Camera className="w-4 h-4" />
                تشغيل الكاميرا
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCameraScan}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition"
              >
                <StopCircle className="w-4 h-4" />
                إيقاف الكاميرا
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium transition"
            >
              <ImagePlus className="w-4 h-4" />
              مسح من صورة
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* نتيجة المسح */}
        {scannedText && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">المحتوى المقروء</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyText}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "تم النسخ" : "نسخ"}
                </button>
                {isUrl && (
                  <a
                    href={scannedText}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    فتح
                  </a>
                )}
              </div>
            </div>

            <p className="text-sm break-all bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-zinc-100">
              {scannedText}
            </p>

            <button
              type="button"
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? "جاري التحليل بالذكاء الاصطناعي..." : "تحليل وفحص المحتوى بالـ AI"}
            </button>

            {aiResult && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs leading-relaxed text-indigo-100 whitespace-pre-line">
                {aiResult}
              </div>
            )}
          </div>
        )}

        {/* السجل الأخير */}
        {history.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-zinc-400 px-1">آخر العمليات</h2>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setScannedText(item.rawText);
                    setAiResult("");
                  }}
                  className="w-full text-right p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-2 transition"
                >
                  <span className="text-xs truncate text-zinc-200">{item.rawText}</span>
                  <span className="text-[10px] text-zinc-500 shrink-0">{item.createdAt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}